const db = require('../config/db');

// Obtener los registros de auditoría (GET) - Ideal para que el Admin los consulte
exports.getAuditLogs = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT audit_logs.*, users.name as user_name, users.email as user_email
            FROM audit_logs 
            LEFT JOIN users ON audit_logs.user_id = users.id 
            ORDER BY audit_logs.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función auxiliar reutilizable para registrar eventos de auditoría desde otros controladores
exports.logAction = async (user_id, action, details) => {
    try {
        await db.query(
            'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
            [user_id || null, action, details]
        );
    } catch (error) {
        console.error('Error al registrar auditoría:', error.message);
    }
};