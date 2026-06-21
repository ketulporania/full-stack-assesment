const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/save',   authMiddleware, upload.single('attachment'), profileController.saveProfile);
router.get('/',        authMiddleware, profileController.getProfile);
router.put('/update',  authMiddleware, upload.single('attachment'), profileController.updateProfile);

module.exports = router;
