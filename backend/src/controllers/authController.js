const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Registro de usuario (Aquí sí guarda hasheado por seguridad)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role || 'user']
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login de usuario (Soporta texto plano directo y hashes)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = rows[0];
        let isValidPassword = false;

        // Si la contraseña en BD empieza con $2b$ o $2a$, usa bcrypt.compare
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            isValidPassword = await bcrypt.compare(password, user.password);
        } else {
            // Si está en texto plano en la BD (como en tu captura), compara directo
            isValidPassword = (user.password === password);
        }

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        let [rows] = await db.query('SELECT id, name, email, role FROM users WHERE deleted_at IS NULL');
        
        if (rows.length === 0) {
            const [newUser] = await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Administrador', 'admin@turing-crm.com', 'admin123', 'admin']
            );
            rows = [{
                id: newUser.insertId,
                name: 'Administrador',
                email: 'admin@turing-crm.com',
                role: 'admin'
            }];
        }

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};