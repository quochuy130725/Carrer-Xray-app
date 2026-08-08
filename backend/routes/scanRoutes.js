const express = require('express');
const router = express.Router();
const { getCases, scanJD, scanComments, analyzeCustomJD, seedDatabase } = require('../controllers/scanController');

router.get('/cases', getCases);
router.post('/jd', scanJD);
router.post('/comments', scanComments);
router.post('/analyze', analyzeCustomJD);
router.post('/admin/seed', seedDatabase);

module.exports = router;
