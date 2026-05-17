const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/recommendations/:profileId
router.get('/:profileId', async (req, res, next) => {
    try {
        const { profileId } = req.params;
        
        // Fetch recommendations linked to products
        const { data: recommendations, error } = await supabase
            .from('recommendations')
            .select('*, products(*)')
            .eq('profile_id', profileId)
            .order('match_score', { ascending: false });

        if (error) {
            throw new Error('Failed to fetch recommendations');
        }

        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
