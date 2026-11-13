const db = require('../config/db');
const { logAction } = require('./auditController');
const { isPositiveId, interactionTypes } = require('../utils/validators');

// Obtener todas las interacciones activas con su cliente y usuario (GET)
exports.getInteractions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT interactions.*, clients.company_name, users.name as user_name 
            FROM interactions 
            JOIN clients ON interactions.client_id = clients.id 
            JOIN users ON interactions.user_id = users.id 
            WHERE interactions.deleted_at IS NULL AND clients.deleted_at IS NULL
            ORDER BY interactions.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva interacción / bitácora (POST)
exports.createInteraction = async (req, res) => {
    try {
        const { client_id, type, notes } = req.body || {};
        if (!isPositiveId(client_id)) return res.status(400).json({ error: 'Selecciona un cliente válido.' });
        if (!interactionTypes.has(type)) return res.status(400).json({ error: 'Selecciona un tipo de interacción válido.' });
        if (typeof notes !== 'string' || !notes.trim() || notes.length > 5000) {
            return res.status(400).json({ error: 'Las notas son obligatorias y deben tener máximo 5,000 caracteres.' });
        }
        const [clients] = await db.query('SELECT id FROM clients WHERE id = ? AND deleted_at IS NULL', [client_id]);
        if (!clients.length) return res.status(400).json({ error: 'El cliente seleccionado no existe o está en la papelera.' });
        const [result] = await db.query(
            'INSERT INTO interactions (client_id, user_id, type, notes) VALUES (?, ?, ?, ?)',
            [Number(client_id), req.user.id, type, notes.trim()]
        );
        await logAction(req.user.id, 'CREATE_INTERACTION', `Se registró una interacción para el cliente con ID: ${client_id}`);
        res.status(201).json({ message: 'Interacción registrada exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de una interacción (DELETE)
exports.deleteInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isPositiveId(id)) return res.status(400).json({ error: 'La interacción indicada no es válida.' });
        const ownerClause = req.user.role === 'admin' ? '' : ' AND user_id = ?';
        const params = [id];
        if (req.user.role !== 'admin') params.push(req.user.id);
        const [result] = await db.query(`UPDATE interactions SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL${ownerClause}`, params);
        if (!result.affectedRows) return res.status(404).json({ error: 'No se encontró una interacción disponible para eliminar.' });
        await logAction(req.user.id, 'SOFT_DELETE_INTERACTION', `Se eliminó lógicamente la interacción con ID: ${id}`);
        res.json({ message: 'Interacción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
