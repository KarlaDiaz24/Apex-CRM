const jwt = require('jsonwebtoken');
const db = require('../config/db');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no está configurado');
    return secret;
};

const authMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Autenticación requerida' });
    }

    try {
        const tokenUser = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
        if (!Number.isInteger(Number(tokenUser.id)) || Number(tokenUser.id) < 1) {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }
        const [users] = await db.query(
            'SELECT id, name, email, role FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
            [tokenUser.id]
        );
        if (!users.length) return res.status(401).json({ error: 'La cuenta ya no está activa' });
        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.message === 'JWT_SECRET no está configurado') {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }
        console.error('Error al validar la sesión:', error.message);
        return res.status(503).json({ error: 'No fue posible validar la sesión en este momento' });
    }
};

authMiddleware.verifyRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
};

module.exports = authMiddleware;
