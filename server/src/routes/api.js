const express = require('express');
const router = express.Router();
const { getThreshold, updateThreshold, setThreshold } = require('../controllers/thresholdController');

router.get('/threshold', getThreshold);


router.post('/threshold', setThreshold);

router.put('/threshold', updateThreshold);

module.exports = router;    
