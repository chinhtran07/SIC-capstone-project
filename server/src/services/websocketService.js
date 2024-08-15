const WebSocket = require('ws');
const websocketController = require('../controllers/websocketController');

let wss;

exports.init = () => {
  wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('message', (message) => {
      websocketController.handleWebSocketMessage(ws, message);
    });

    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server' }));
  });
};

exports.broadcastData = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};
