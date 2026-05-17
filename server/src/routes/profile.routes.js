const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/profiles/:id/dashboard
router.get('/:id/dashboard', async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Fetch profile
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileErr) return res.status(404).json({ success: false, message: 'Profile not found' });

        // Fetch history
        const { data: history } = await supabase
            .from('beauty_history')
            .select('*')
            .eq('profile_id', id)
            .order('recorded_at', { ascending: true });

        res.status(200).json({
            success: true,
            data: {
                profile,
                history
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
