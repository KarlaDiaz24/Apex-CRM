const db = require('../config/db');
const { logAction } = require('./auditController');
const { isText, isPositiveId, isDate, isAmount, businessTextPattern, dealStages } = require('../utils/validators');

const validateDeal = ({ client_id, title, amount, stage, closing_date, requireClient = true }) => {
    if (requireClient && !isPositiveId(client_id)) return 'Selecciona un cliente válido.';
    if (!isText(title, { min: 2, max: 150, pattern: businessTextPattern })) {
        return 'El título debe tener de 2 a 150 caracteres: letras, números y . , & \' ( ) / # : + -.';
    }
    if (!isAmount(amount, true)) return 'El monto debe ser un número entre 0 y 99,999,999.99 con máximo 2 decimales.';
    if (stage !== undefined && !dealStages.has(stage)) return 'Selecciona una etapa de oportunidad válida.';
    if (!isDate(closing_date, true)) return 'La fecha estimada de cierre no es válida.';
    return null;
};

// Obtener todas las oportunidades activas (GET)
exports.getDeals = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT deals.*, clients.company_name 
            FROM deals 
            JOIN clients ON deals.client_id = clients.id 
            WHERE deals.deleted_at IS NULL AND clients.deleted_at IS NULL
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una oportunidad de venta (POST)
exports.createDeal = async (req, res) => {
    try {
        const { client_id, title, amount, stage, closing_date } = req.body || {};
        const validationError = validateDeal({ client_id, title, amount, stage, closing_date });
        if (validationError) return res.status(400).json({ error: validationError });
        const [clients] = await db.query('SELECT id FROM clients WHERE id = ? AND deleted_at IS NULL', [client_id]);
        if (!clients.length) return res.status(400).json({ error: 'El cliente seleccionado no existe o está en la papelera.' });

        const [result] = await db.query(
            'INSERT INTO deals (client_id, title, amount, stage, closing_date) VALUES (?, ?, ?, ?, ?)',
            [Number(client_id), title.trim(), amount === '' || amount === undefined || amount === null ? 0 : amount, stage || 'Prospecto', closing_date || null]
        );
        await logAction(req.user.id, 'CREATE_DEAL', `Se creó la oportunidad: ${title}`);
        res.status(201).json({ message: 'Oportunidad de venta creada exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una oportunidad (PUT)
exports.updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, stage, closing_date } = req.body || {};
        const validationError = validateDeal({ title, amount, stage, closing_date, requireClient: false });
        if (validationError) return res.status(400).json({ error: validationError });
        await db.query(
            'UPDATE deals SET title = ?, amount = ?, stage = ?, closing_date = ? WHERE id = ?',
            [title.trim(), amount === '' || amount === undefined || amount === null ? 0 : amount, stage || 'Prospecto', closing_date || null, id]
        );
        await logAction(req.user.id, 'UPDATE_DEAL', `Se actualizó la oportunidad con ID: ${id}`);
        res.json({ message: 'Oportunidad actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de una oportunidad (DELETE)
exports.deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE deals SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', [id]);
        await logAction(req.user.id, 'SOFT_DELETE_DEAL', `Se eliminó lógicamente la oportunidad con ID: ${id}`);
        res.json({ message: 'Oportunidad eliminada lógicamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
