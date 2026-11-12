const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener todas las tareas activas (GET)
exports.getTasks = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT tasks.*, clients.company_name, users.name as user_name 
            FROM tasks 
            LEFT JOIN clients ON tasks.client_id = clients.id 
            LEFT JOIN users ON tasks.user_id = users.id 
            WHERE tasks.deleted_at IS NULL
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva tarea (POST)
exports.createTask = async (req, res) => {
    try {
        let { user_id, client_id, title, description, due_date } = req.body;
        
        // 1. Validar que exista un usuario asignado válido
        if (user_id) {
            const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
            if (userExists.length === 0) {
                user_id = null;
            }
        }

        if (!user_id) {
            const [firstUser] = await db.query('SELECT id FROM users LIMIT 1');
            if (firstUser.length > 0) {
                user_id = firstUser[0].id;
            } else {
                // Crear usuario por defecto si la base de datos está vacía
                const salt = await bcrypt.genSalt(10);
                const defaultHash = await bcrypt.hash('admin123', salt);
                const [newUser] = await db.query(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    ['Administrador', 'admin@turing-crm.com', defaultHash, 'admin']
                );
                user_id = newUser.insertId;
            }
        }
        
        // 2. Si client_id está vacío o no existe, convertirlo a null
        if (!client_id || client_id === '') {
            client_id = null;
        } else {
            const [clientExists] = await db.query('SELECT id FROM clients WHERE id = ?', [client_id]);
            if (clientExists.length === 0) {
                client_id = null;
            }
        }

        // 3. Validar due_date
        if (!due_date || due_date === '') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            due_date = tomorrow.toISOString().slice(0, 19).replace('T', ' ');
        }

        const [result] = await db.query(
            'INSERT INTO tasks (user_id, client_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)',
            [user_id, client_id, title, description || '', due_date]
        );
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
        const { title, description, due_date, completed } = req.body;
        await db.query(
            'UPDATE tasks SET title = ?, description = ?, due_date = ?, completed = ? WHERE id = ?',
            [title, description, due_date, completed, id]
        );
        res.json({ message: 'Tarea actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marcar tarea como completada (PUT exclusivo para el botón)
exports.completeTask = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'UPDATE tasks SET completed = 1 WHERE id = ?',
            [id]
        );
        res.json({ message: 'Tarea marcada como completada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de una tarea (DELETE)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE tasks SET deleted_at = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};