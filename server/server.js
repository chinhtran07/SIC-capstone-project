require('dotenv').config();
const mongoose = require('mongoose');
const mqttService = require('./src/services/mqttService');
const websocketService = require('./src/services/websocketService');
const mongoConfig = require('./src/configs/mongoConfig');

// Connect to MongoDB
mongoose.connect(mongoConfig.uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Initialize MQTT and WebSocket services
mqttService.init();
websocketService.init();
