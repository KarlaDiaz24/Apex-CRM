const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAction } = require('./auditController');
const { isText, isEmail, isPositiveId, namePattern } = require('../utils/validators');

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
});

const issueToken = (user) => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no está configurado');
    return jwt.sign(publicUser(user), process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!isText(name, { min: 2, max: 100, pattern: namePattern })) {
            return res.status(400).json({ error: 'El nombre debe tener de 2 a 100 caracteres y usar solo letras, espacios, puntos, apóstrofes o guiones.' });
        }
        if (!isEmail(email)) return res.status(400).json({ error: 'Ingresa un correo válido de máximo 100 caracteres.' });
        if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 72 bytes.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), passwordHash, 'user']
        );
        await logAction(req.user.id, 'CREATE_USER', `El administrador registró al usuario: ${email.trim().toLowerCase()}`);
        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El correo ya está registrado' });
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ error: 'No fue posible registrar el usuario' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!isEmail(email) || typeof password !== 'string' || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        const [rows] = await db.query(
            'SELECT id, name, email, password, role FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
            [email.trim().toLowerCase()]
        );
        if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

        const user = rows[0];
        const isBcryptHash = /^\$2[aby]\$/.test(user.password || '');
        const isValidPassword = isBcryptHash
            ? await bcrypt.compare(password, user.password)
            : user.password === password;
        if (!isValidPassword) return res.status(401).json({ error: 'Credenciales inválidas' });
        if (!['admin', 'user'].includes(user.role)) return res.status(403).json({ error: 'Rol de usuario inválido' });

        // Actualiza las cuentas sembradas históricamente en texto plano al iniciar sesión.
        if (!isBcryptHash) {
            const passwordHash = await bcrypt.hash(password, 12);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, user.id]);
        }

        const safeUser = publicUser(user);
        res.json({ message: 'Login exitoso', token: issueToken(safeUser), user: safeUser });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        res.status(500).json({ error: 'No fue posible iniciar sesión' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE deleted_at IS NULL ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar usuarios:', error.message);
        res.status(500).json({ error: 'No fue posible consultar usuarios' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body || {};
        if (!isPositiveId(id)) return res.status(400).json({ error: 'El usuario indicado no es válido.' });
        if (!isText(name, { min: 2, max: 100, pattern: namePattern })) {
            return res.status(400).json({ error: 'El nombre debe tener de 2 a 100 caracteres y usar solo letras, espacios, puntos, apóstrofes o guiones.' });
        }
        if (!isEmail(email)) return res.status(400).json({ error: 'Ingresa un correo válido de máximo 100 caracteres.' });
        if (password !== undefined && password !== '' && (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72)) {
            return res.status(400).json({ error: 'La contraseña nueva debe tener al menos 8 y máximo 72 bytes.' });
        }

        const [targets] = await db.query('SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
        if (!targets.length || targets[0].role !== 'user') return res.status(404).json({ error: 'No se encontró un agente activo para editar.' });
        const normalizedEmail = email.trim().toLowerCase();
        const [emailOwners] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ? AND deleted_at IS NULL LIMIT 1', [normalizedEmail, id]);
        if (emailOwners.length) return res.status(409).json({ error: 'Ese correo ya está registrado en otra cuenta.' });

        const values = [name.trim(), normalizedEmail];
        let query = 'UPDATE users SET name = ?, email = ?';
        if (password) {
            query += ', password = ?';
            values.push(await bcrypt.hash(password, 12));
        }
        query += " WHERE id = ? AND role = 'user' AND deleted_at IS NULL";
        values.push(id);
        await db.query(query, values);
        await logAction(req.user.id, 'UPDATE_USER', `El administrador actualizó el agente con ID: ${id}`);
        res.json({ message: 'Agente actualizado correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ese correo ya está registrado en otra cuenta.' });
        console.error('Error al actualizar agente:', error.message);
        res.status(500).json({ error: 'No fue posible actualizar el agente' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isPositiveId(id)) return res.status(400).json({ error: 'El usuario indicado no es válido.' });
        if (Number(id) === Number(req.user.id)) return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta.' });
        const [result] = await db.query(
            "UPDATE users SET deleted_at = NOW() WHERE id = ? AND role = 'user' AND deleted_at IS NULL",
            [id]
        );
        if (!result.affectedRows) return res.status(404).json({ error: 'No se encontró un agente activo para desactivar.' });
        await logAction(req.user.id, 'SOFT_DELETE_USER', `El administrador desactivó al agente con ID: ${id}`);
        res.json({ message: 'Agente desactivado correctamente' });
    } catch (error) {
        console.error('Error al desactivar agente:', error.message);
        res.status(500).json({ error: 'No fue posible desactivar el agente' });
    }
};

exports.me = (req, res) => res.json({ user: req.user });
