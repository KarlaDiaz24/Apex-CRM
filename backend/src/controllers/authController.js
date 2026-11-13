const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ error: 'Nombre, correo válido y contraseña de al menos 8 caracteres son requeridos' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), passwordHash, 'user']
        );
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
        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
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

exports.me = (req, res) => res.json({ user: req.user });
