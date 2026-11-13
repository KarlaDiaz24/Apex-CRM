const db = require('../config/db');
const { logAction } = require('./auditController');
const { isText, isEmail, isPhone, namePattern, businessTextPattern, clientStatuses } = require('../utils/validators');

const validateClient = ({ company_name, contact_name, email, phone, status }) => {
    if (!isText(company_name, { min: 1, max: 150, pattern: businessTextPattern })) {
        return 'La empresa es obligatoria (máximo 150 caracteres; letras, números y . , & \' ( ) / # : + -).';
    }
    if (!isText(contact_name, { min: 2, max: 100, pattern: namePattern })) {
        return 'El contacto debe tener de 2 a 100 caracteres y contener solo letras, espacios, puntos, apóstrofes o guiones.';
    }
    if (!isEmail(email)) return 'Ingresa un correo válido de máximo 100 caracteres.';
    if (!isPhone(phone)) return 'El teléfono es obligatorio y debe contener exactamente 10 dígitos numéricos.';
    if (status !== undefined && !clientStatuses.has(status)) return 'Selecciona un estado de cliente válido.';
    return null;
};

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
        const { company_name, contact_name, email, phone, status } = req.body || {};
        const validationError = validateClient({ company_name, contact_name, email, phone, status });
        if (validationError) return res.status(400).json({ error: validationError });

        const [result] = await db.query(
            'INSERT INTO clients (company_name, contact_name, email, phone, status) VALUES (?, ?, ?, ?, ?)',
            [company_name.trim(), contact_name.trim(), email.trim().toLowerCase(), phone, status || 'Nuevo']
        );

        // <-- 2. Registrar en auditoría la creación
        await logAction(req.user.id, 'CREATE_CLIENT', `Se creó el cliente: ${company_name}`);

        res.status(201).json({ message: 'Cliente creado exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un cliente (PUT)
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, contact_name, email, phone, status } = req.body || {};
        const validationError = validateClient({ company_name, contact_name, email, phone, status });
        if (validationError) return res.status(400).json({ error: validationError });
        
        await db.query(
            'UPDATE clients SET company_name = ?, contact_name = ?, email = ?, phone = ?, status = ? WHERE id = ?',
            [company_name.trim(), contact_name.trim(), email.trim().toLowerCase(), phone, status, id]
        );

        // <-- 3. Registrar en auditoría la actualización
        await logAction(req.user.id, 'UPDATE_CLIENT', `Se actualizó el cliente con ID: ${id}`);

        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminación lógica de un cliente (DELETE -> Soft Delete)
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE clients SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', [id]);

        // <-- 4. Registrar en auditoría el borrado lógico
        await logAction(req.user.id, 'SOFT_DELETE_CLIENT', `Se eliminó lógicamente el cliente con ID: ${id}`);

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Restaurar un cliente eliminado lógicamente (PUT)
exports.restoreClient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE clients SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL', [id]);

        // <-- 5. Registrar en auditoría la restauración
        await logAction(req.user.id, 'RESTORE_CLIENT', `Se restauró el cliente con ID: ${id}`);

        res.json({ message: 'Cliente restaurado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
