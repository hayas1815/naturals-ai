const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/security');

// GET /api/profiles/me/dashboard — Returns authenticated user's dashboard data
router.get('/me/dashboard', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch the beauty profile for this user
        const { data: profile, error: profileErr } = await supabase
            .from('beauty_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (profileErr || !profile) {
            return res.status(404).json({ success: false, message: 'Beauty profile not found. Please complete your initial scan.' });
        }

        // Fetch beauty score
        const { data: scores } = await supabase
            .from('beauty_scores')
            .select('*')
            .eq('profile_id', profile.id)
            .order('calculated_at', { ascending: false })
            .limit(1);

        // Fetch timeline history for charts
        const { data: history } = await supabase
            .from('beauty_timelines')
            .select('metric_name, metric_value, recorded_at')
            .eq('profile_id', profile.id)
            .order('recorded_at', { ascending: true });

        // Fetch latest AI report
        const { data: latestReport } = await supabase
            .from('ai_reports')
            .select('id, detected_concerns, created_at')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);

        res.status(200).json({
            success: true,
            data: {
                profile,
                scores: scores?.[0] || null,
                history: history || [],
                latestReport: latestReport?.[0] || null,
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/profiles/:id/dashboard — Admin/Stylist only: view any user's dashboard
router.get('/:id/dashboard', authenticate, authorize('admin', 'stylist'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: profile, error: profileErr } = await supabase
            .from('beauty_profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileErr || !profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        const { data: history } = await supabase
            .from('beauty_timelines')
            .select('metric_name, metric_value, recorded_at')
            .eq('profile_id', id)
            .order('recorded_at', { ascending: true });

        res.status(200).json({ success: true, data: { profile, history: history || [] } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
