const verifyRole = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'] || 'user';

        if (requiredRole && userRole !== requiredRole) {
            return res.status(403).json({ error: 'Acceso denegado: No tienes los permisos necesarios (Rol requerido: ' + requiredRole + ')' });
        }
        
        next();
    };
};

const authMiddleware = (req, res, next) => {
    return verifyRole()(req, res, next);
};

authMiddleware.verifyRole = verifyRole;

module.exports = authMiddleware;
