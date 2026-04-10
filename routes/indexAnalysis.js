const express = require('express');
const router = express.Router();
const indexAnalysisController = require('../controllers/indexAnalysisController');

// Index Analysis Endpoints
router.get('/analyze/name', indexAnalysisController.testNameIndex);
router.get('/analyze/email-age', indexAnalysisController.testEmailAgeIndex);
router.get('/analyze/hobbies', indexAnalysisController.testHobbiesIndex);
router.get('/analyze/text', indexAnalysisController.testTextIndex);
router.get('/analyze/userid', indexAnalysisController.testHashedIndex);
router.get('/indexes', indexAnalysisController.getIndexes);
router.get('/stats', indexAnalysisController.getIndexStats);

module.exports = router;
