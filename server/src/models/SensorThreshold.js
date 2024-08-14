const mongoose = require('mongoose');

const sensorThresholdSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  soilMoisture: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SensorThreshold', sensorThresholdSchema);