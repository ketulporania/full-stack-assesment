const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:type', authMiddleware, documentController.generateDocument);

module.exports = router;
