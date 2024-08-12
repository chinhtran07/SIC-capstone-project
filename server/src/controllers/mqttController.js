const SensorData = require('../models/SensorData');
const websocketService = require('../services/websocketService');

exports.handleMessage = async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === 'garden/plant/metrics') {
      // Save Sensor Data to MongoDB
      const sensorData = new SensorData({
        temperature: data.temperature,
        humidity: data.humidity,
        soilMoisture: data.soilMoisture,
        timestamp: new Date(),
      });

      await sensorData.save();
      console.log('Document saved:', sensorData);

      // Broadcast Sensor Data to WebSocket Clients
      websocketService.broadcastData(sensorData);

    } else if (topic === 'garden/plant/control') {
      // Broadcast Control Status to WebSocket Clients
      websocketService.broadcastData(data);  // Sending the control status directly
      console.log('Control status broadcasted:', data);
    }

  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
};
