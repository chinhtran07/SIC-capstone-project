const websocketService = require('../services/websocketService');
const {saveSensorData} = require('./sensorDataController');

exports.handleMessage = async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === 'garden/plant/metrics') {
      await saveSensorData(data);
      websocketService.broadcastData(data);

    } else if (topic === 'garden/plant/control') {
      websocketService.broadcastData(data);
      console.log('Control status broadcasted:', data);
    }

  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
};
