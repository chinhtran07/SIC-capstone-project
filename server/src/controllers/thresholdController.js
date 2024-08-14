const { MqttClient } = require('mqtt');
const SensorThreshold = require('../models/SensorThreshold');
const mqtt = require('../services/mqttService');

mqtt.init();

const getThreshold = async (req, res) => {
    try {
        const threshold = await SensorThreshold.findOne().sort({ createdAt: -1 });
        if (!threshold) {
            return res.status(404).json({ message: 'Threshold not found' });
        }
        res.json(threshold);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const setThreshold = async (req, res) => {
    try {
        const { temperature, humidity, soilMoisture} = req.body;
        const threshold = new SensorThreshold({ temperature, humidity, soilMoisture });
        await threshold.save();
        res.status(201).json(threshold);
    } catch {
        res.status(500).json({ message: 'Server error', error });
    }
}

const updateThreshold = async (req, res) => {
    try {
        const { temperature, humidity, soilMoisture } = req.body;

        let threshold = await SensorThreshold.findOne({});

        if (!threshold) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Cập nhật các giá trị mới
        threshold.temperature = temperature;
        threshold.humidity = humidity;  
        threshold.soilMoisture = soilMoisture;

        // Lưu lại các thay đổi
        await threshold.save();

        const payload = JSON.stringify({temperature: temperature, humidity: humidity, soilMoisture: soilMoisture});

        mqtt.publish("garden/plant/threshold", payload);

        console.log('Updated threshold:', threshold);

        res.json(threshold);
    } catch (error) {
        console.error('Error in updateThreshold:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = { getThreshold, updateThreshold, setThreshold };
