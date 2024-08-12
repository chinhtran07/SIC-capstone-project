const mqttService = require('../services/mqttService');

exports.handleWebSocketMessage = (ws, message) => {
  try {
    const data = JSON.parse(message);

    // Handle Pump Control Command
    if (data.type === 'control' && data.device === 'pump') {
      mqttService.handlePumpControl(data.action);
    }
  } catch (error) {
    console.error('Error handling WebSocket message:', error);
  }
};
