const db = require('../config/db');

// Obtener todas las interacciones activas con su cliente y usuario (GET)
exports.getInteractions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT interactions.*, clients.company_name, users.name as user_name 
            FROM interactions 
            JOIN clients ON interactions.client_id = clients.id 
            JOIN users ON interactions.user_id = users.id 
            WHERE interactions.deleted_at IS NULL AND clients.deleted_at IS NULL
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva interacción / bitácora (POST)
exports.createInteraction = async (req, res) => {
    try {
        const { client_id, user_id, type, notes } = req.body;
        const [result] = await db.query(
            'INSERT INTO interactions (client_id, user_id, type, notes) VALUES (?, ?, ?, ?)',
            [client_id, user_id, type, notes]
        );
        res.status(201).json({ message: 'Interacción registrada exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de una interacción (DELETE)
exports.deleteInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE interactions SET deleted_at = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Interacción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};