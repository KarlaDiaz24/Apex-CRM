const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no está configurado');
    return secret;
};

const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Autenticación requerida' });
    }

    try {
        req.user = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

authMiddleware.verifyRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
};

module.exports = authMiddleware;
