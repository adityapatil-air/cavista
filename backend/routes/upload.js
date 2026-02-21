const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/file', authMiddleware, upload.single('file'), uploadController.uploadLocal);

module.exports = router;
