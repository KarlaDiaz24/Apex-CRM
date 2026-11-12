// Middleware básico para simular validación de roles y seguridad
const verifyRole = (requiredRole) => {
    return (req, res, next) => {
        // En una implementación real con JWT, el usuario vendría en req.user tras decodificar el token.
        // Para la prueba, simularemos la lectura del rol desde los headers o el body.
        const userRole = req.headers['x-user-role'] || 'user';

        if (requiredRole && userRole !== requiredRole) {
            return res.status(403).json({ error: 'Acceso denegado: No tienes los permisos necesarios (Rol requerido: ' + requiredRole + ')' });
        }
        
        next();
    };
};

// Middleware base cuando se usa directamente: authMiddleware
const authMiddleware = (req, res, next) => {
    return verifyRole()(req, res, next);
};

authMiddleware.verifyRole = verifyRole;

module.exports = authMiddleware;
