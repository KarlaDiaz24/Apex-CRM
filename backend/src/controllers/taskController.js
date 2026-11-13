const db = require('../config/db');
const { logAction } = require('./auditController');
const { isText, isDate, isPositiveId, businessTextPattern } = require('../utils/validators');

const isDescription = (value) => value === undefined || value === null ||
    (typeof value === 'string' && value.length <= 2000 && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value));

const validateTask = ({ title, description, due_date }) => {
    if (!isText(title, { min: 2, max: 150, pattern: businessTextPattern })) {
        return 'El título debe tener de 2 a 150 caracteres: letras, números y . , & \' ( ) / # : + -.';
    }
    if (!isDescription(description)) return 'Las notas aceptan texto de hasta 2,000 caracteres.';
    if (!isDate(due_date)) return 'Selecciona una fecha límite válida.';
    return null;
};

// Obtener todas las tareas activas (GET)
exports.getTasks = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const [rows] = await db.query(`
            SELECT tasks.*, clients.company_name, users.name as user_name 
            FROM tasks 
            LEFT JOIN clients ON tasks.client_id = clients.id 
            LEFT JOIN users ON tasks.user_id = users.id 
            WHERE tasks.deleted_at IS NULL ${isAdmin ? '' : 'AND tasks.user_id = ?'}
            ORDER BY tasks.due_date ASC
        `, isAdmin ? [] : [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva tarea (POST)
exports.createTask = async (req, res) => {
    try {
        let { client_id, title, description, due_date } = req.body || {};
        const user_id = req.user.id;
        const validationError = validateTask({ title, description, due_date });
        if (validationError) return res.status(400).json({ error: validationError });
        
        // El usuario asociado sale del JWT; un client_id vacío deja la tarea sin cliente.
        if (!client_id || client_id === '') {
            client_id = null;
        } else {
            if (!isPositiveId(client_id)) return res.status(400).json({ error: 'Selecciona un cliente válido o deja el campo vacío.' });
            const [clientExists] = await db.query('SELECT id FROM clients WHERE id = ? AND deleted_at IS NULL', [client_id]);
            if (clientExists.length === 0) return res.status(400).json({ error: 'El cliente seleccionado no existe o está en la papelera.' });
        }

        const [result] = await db.query(
            'INSERT INTO tasks (user_id, client_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)',
            [user_id, client_id, title.trim(), description || '', due_date]
        );
        await logAction(req.user.id, 'CREATE_TASK', `Se creó la tarea: ${title}`);
        res.status(201).json({ message: 'Tarea creada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error en createTask:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Marcar tarea como completada o actualizar (PUT)
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isPositiveId(id)) return res.status(400).json({ error: 'La tarea indicada no es válida.' });
        const { title, description, due_date, completed } = req.body || {};
        const validationError = validateTask({ title, description, due_date });
        if (validationError) return res.status(400).json({ error: validationError });
        if (![true, false, 0, 1].includes(completed)) return res.status(400).json({ error: 'Indica si la tarea está completada.' });
        const ownerClause = req.user.role === 'admin' ? '' : ' AND user_id = ?';
        const accessParams = [id];
        if (req.user.role !== 'admin') accessParams.push(req.user.id);
        const [accessibleTasks] = await db.query(`SELECT id FROM tasks WHERE id = ? AND deleted_at IS NULL${ownerClause}`, accessParams);
        if (!accessibleTasks.length) return res.status(404).json({ error: 'No se encontró una tarea disponible para actualizar.' });
        const params = [title.trim(), description || '', due_date, completed, id];
        if (req.user.role !== 'admin') params.push(req.user.id);
        await db.query(
            `UPDATE tasks SET title = ?, description = ?, due_date = ?, completed = ? WHERE id = ? AND deleted_at IS NULL${ownerClause}`,
            params
        );
        await logAction(req.user.id, 'UPDATE_TASK', `Se actualizó la tarea con ID: ${id}`);
        res.json({ message: 'Tarea actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marcar tarea como completada (PUT exclusivo para el botón)
exports.completeTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isPositiveId(id)) return res.status(400).json({ error: 'La tarea indicada no es válida.' });
        const ownerClause = req.user.role === 'admin' ? '' : ' AND user_id = ?';
        const params = [id];
        if (req.user.role !== 'admin') params.push(req.user.id);
        const [result] = await db.query(
            `UPDATE tasks SET completed = 1 WHERE id = ? AND deleted_at IS NULL${ownerClause}`,
            params
        );
        if (!result.affectedRows) return res.status(404).json({ error: 'No se encontró una tarea disponible para completar.' });
        await logAction(req.user.id, 'COMPLETE_TASK', `Se completó la tarea con ID: ${id}`);
        res.json({ message: 'Tarea marcada como completada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de una tarea (DELETE)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isPositiveId(id)) return res.status(400).json({ error: 'La tarea indicada no es válida.' });
        const ownerClause = req.user.role === 'admin' ? '' : ' AND user_id = ?';
        const params = [id];
        if (req.user.role !== 'admin') params.push(req.user.id);
        const [result] = await db.query(`UPDATE tasks SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL${ownerClause}`, params);
        if (!result.affectedRows) return res.status(404).json({ error: 'No se encontró una tarea disponible para eliminar.' });
        await logAction(req.user.id, 'SOFT_DELETE_TASK', `Se eliminó lógicamente la tarea con ID: ${id}`);
        res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
