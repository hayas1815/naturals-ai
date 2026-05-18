const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// GET /api/recommendations/me — Authenticated user's personalized recommendations
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // First get the profile id
        const { data: profile } = await supabase
            .from('beauty_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!profile) {
            return res.status(404).json({ success: false, message: 'No profile found. Please complete a scan first.' });
        }

        // Fetch recommendations with product details
        const { data: recommendations, error } = await supabase
            .from('recommendations')
            .select('*, products(*)')
            .eq('profile_id', profile.id)
            .order('match_confidence', { ascending: false });

        if (error) throw new Error('Failed to fetch recommendations');

        res.status(200).json({ success: true, data: recommendations || [] });
    } catch (error) {
        next(error);
    }
});

// GET /api/recommendations/:profileId — Admin/Stylist: view recommendations for any profile
router.get('/:profileId', authenticate, async (req, res, next) => {
    try {
        const { profileId } = req.params;

        const { data: recommendations, error } = await supabase
            .from('recommendations')
            .select('*, products(*)')
            .eq('profile_id', profileId)
            .order('match_confidence', { ascending: false });

        if (error) throw new Error('Failed to fetch recommendations');

        res.status(200).json({ success: true, data: recommendations || [] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
