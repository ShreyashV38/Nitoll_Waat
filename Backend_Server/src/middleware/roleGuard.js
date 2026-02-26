/**
 * Role-based access control middleware.
 * Usage: router.post('/admin-only', protect, roleGuard('ADMIN'), controller.fn)
 *
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
        }
        next();
    };
};

module.exports = roleGuard;
