const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');
const { auditLog, suspiciousActivityDetector } = require('../middleware/security');

// Use memory storage for multer since we pass buffer directly to Cloudinary/Gemini
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Whitelist image MIME types to prevent malicious uploads
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are accepted.'));
        }
    }
});

// POST /api/ai/analyze — Protected: requires JWT + audit log
router.post(
    '/analyze',
    suspiciousActivityDetector,
    authenticate,
    auditLog,
    upload.single('image'),
    aiController.analyzeScan
);

module.exports = router;
