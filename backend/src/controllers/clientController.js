const db = require('../config/db');
const { logAction } = require('./auditController'); // <-- 1. Importar la función de auditoría

// Obtener todos los clientes activos (GET)
exports.getClients = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clients WHERE deleted_at IS NULL');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener clientes eliminados lógicamente - Papelera (GET)
exports.getDeletedClients = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clients WHERE deleted_at IS NOT NULL');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo cliente (POST)
exports.createClient = async (req, res) => {
    try {
        const { company_name, contact_name, email, phone, status, user_id } = req.body || {};
        const [result] = await db.query(
            'INSERT INTO clients (company_name, contact_name, email, phone, status) VALUES (?, ?, ?, ?, ?)',
            [company_name, contact_name, email, phone, status || 'Nuevo']
        );

        // <-- 2. Registrar en auditoría la creación
        await logAction(user_id || null, 'CREATE_CLIENT', `Se creó el cliente: ${company_name}`);

        res.status(201).json({ message: 'Cliente creado exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un cliente (PUT)
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, contact_name, email, phone, status, user_id } = req.body || {};
        
        await db.query(
            'UPDATE clients SET company_name = ?, contact_name = ?, email = ?, phone = ?, status = ? WHERE id = ?',
            [company_name, contact_name, email, phone, status, id]
        );

        // <-- 3. Registrar en auditoría la actualización
        await logAction(user_id || null, 'UPDATE_CLIENT', `Se actualizó el cliente con ID: ${id}`);

        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de un cliente (DELETE -> Soft Delete)
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.body?.user_id || null;

        await db.query('UPDATE clients SET deleted_at = NOW() WHERE id = ?', [id]);

        // <-- 4. Registrar en auditoría el borrado lógico
        await logAction(user_id, 'SOFT_DELETE_CLIENT', `Se eliminó lógicamente el cliente con ID: ${id}`);

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Restaurar un cliente eliminado lógicamente (PUT)
exports.restoreClient = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.body?.user_id || null;

        await db.query('UPDATE clients SET deleted_at = NULL WHERE id = ?', [id]);

        // <-- 5. Registrar en auditoría la restauración
        await logAction(user_id, 'RESTORE_CLIENT', `Se restauró el cliente con ID: ${id}`);

        res.json({ message: 'Cliente restaurado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};