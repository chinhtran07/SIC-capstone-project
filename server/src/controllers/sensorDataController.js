const SensorData = require('../models/SensorData');
const moment = require('moment');

const saveSensorData = async (data) => {
    try {
        const sensorData = new SensorData(data);
        await sensorData.save();
        console.log('Sensor data saved', data);
    } catch (error) {
        console.error('Error saving sensor data:', error);
    }
}

const getSensorData = async (req, res) => {
    try {
        const sensorData = await SensorData.findOne().sort({ timestamp: -1 });
        if (!sensorData) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.json(sensorData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}


const getAllSensorDataToday = async (req, res) => {
    try {
        // Get the start and end of today
        const startOfToday = moment().startOf('day').toDate();
        const endOfToday = moment().endOf('day').toDate();
        
        // Find sensor data created today
        const sensorData = await SensorData.find({
            timestamp: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        }).sort({ createdAt: -1 });
        
        if (sensorData.length === 0) {
            return res.status(404).json({ message: 'No sensor data found for today' });
        }
        
        res.json({results: sensorData});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = {saveSensorData, getSensorData, getAllSensorDataToday};