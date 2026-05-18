const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/security');

// All admin routes require authentication + admin/stylist role
router.use(authenticate, authorize('admin', 'stylist'));

// GET /api/admin/analytics — Platform-wide metrics
router.get('/analytics', async (req, res, next) => {
    try {
        const [
            { count: totalUsers },
            { count: totalScans },
            { data: recentMetrics },
        ] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('ai_reports').select('id', { count: 'exact', head: true }),
            supabase.from('admin_analytics')
                .select('*')
                .order('metric_date', { ascending: false })
                .limit(30),
        ]);

        res.status(200).json({
            success: true,
            data: { totalUsers, totalScans, recentMetrics },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/users — List all users with their profiles
router.get('/users', authorize('admin'), async (req, res, next) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*, beauty_profiles(id, first_name, last_name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/audit-logs — View all security audit logs
router.get('/audit-logs', authorize('admin'), auditLog, async (req, res, next) => {
    try {
        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw error;
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
