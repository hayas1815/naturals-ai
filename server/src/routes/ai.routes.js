const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');

// Use memory storage for multer since we pass buffer directly to Cloudinary/Gemini
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/ai/analyze
router.post('/analyze', upload.single('image'), aiController.analyzeScan);

module.exports = router;
