const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Middleware to verify Supabase JWT and attach user + role to req.
 * Usage: router.get('/protected', authenticate, handler)
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.warn(`Auth failure: ${error?.message || 'No user found'} | IP: ${req.ip}`);
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token.' });
        }

        // Fetch user role from the profiles table
        const { data: profile } = await supabase
            .from('beauty_profiles')
            .select('id, role')
            .eq('user_id', user.id)
            .single();

        req.user = user;
        req.profile = profile || null;
        req.userRole = profile?.role || 'customer';

        next();
    } catch (err) {
        logger.error('Auth middleware error', { error: err.message });
        return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
};

/**
 * Role-based authorization factory.
 * Usage: router.get('/admin', authenticate, authorize('admin', 'super_admin'), handler)
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            logger.warn(`Authorization denied for role "${req.userRole}" on ${req.method} ${req.url} | User: ${req.user?.id}`);
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
