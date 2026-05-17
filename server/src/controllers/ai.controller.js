const AIService = require('../services/ai.service');

const analyzeScan = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        // Mock profile ID for demonstration if auth is not fully hooked up
        const profileId = req.body.profileId || '00000000-0000-0000-0000-000000000000';

        const result = await AIService.analyzeFaceAndHair(
            req.file.buffer,
            req.file.mimetype,
            profileId
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    analyzeScan
};
