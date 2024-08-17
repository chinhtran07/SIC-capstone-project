const express = require('express');
const router = express.Router();
const { getThreshold, updateThreshold, setThreshold } = require('../controllers/thresholdController');
const { getSensorData, getAllSensorDataToday } = require('../controllers/sensorDataController');

router.get('/threshold', getThreshold);


router.post('/threshold', setThreshold);

router.put('/threshold', updateThreshold);

router.get('/sensor-data/get-latest-data', getSensorData);

router.get('/sensor-data/get-data-today', getAllSensorDataToday);

module.exports = router;    
