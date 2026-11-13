const db = require('../config/db');

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
        const { client_id, title, amount, stage, closing_date } = req.body;
        const [result] = await db.query(
            'INSERT INTO deals (client_id, title, amount, stage, closing_date) VALUES (?, ?, ?, ?, ?)',
            [client_id, title, amount || 0.00, stage || 'Prospecto', closing_date || null]
        );
        res.status(201).json({ message: 'Oportunidad de venta creada exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una oportunidad (PUT)
exports.updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, stage, closing_date } = req.body;
        await db.query(
            'UPDATE deals SET title = ?, amount = ?, stage = ?, closing_date = ? WHERE id = ?',
            [title, amount, stage, closing_date, id]
        );
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
        res.json({ message: 'Oportunidad eliminada lógicamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
