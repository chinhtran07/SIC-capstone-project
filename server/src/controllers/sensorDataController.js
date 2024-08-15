const SensorData = require('../models/SensorData');

const saveSensorData = async (data) => {
    try {
        const sensorData = new SensorData(data);
        await sensorData.save();
        console.log('Sensor data saved', data);
    } catch (error) {
        console.error('Error saving sensor data:', error);
    }
}

module.exports = {saveSensorData};