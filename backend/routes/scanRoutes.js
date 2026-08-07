const express = require('express');
const router = express.Router();
const { scanJD, scanComments } = require('../controllers/scanController');

router.post('/jd', scanJD);
router.post('/comments', scanComments);

module.exports = router;
