const mqtt = require('mqtt');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const SensorData = require('./src/models/SensorData'); // Adjust the path as necessary

// MQTT Broker Configuration
const brokerUrl = 'mqtts://07c239adaea14c26828e02ba947d8713.s1.eu.hivemq.cloud';
const mqttOptions = {
  port: 8883, 
  username: 'device', 
  password: 'Admin@123',
};

// MongoDB Configuration
const mongoUri = 'mongodb+srv://chinht1807:Chinhtran18@mongodb-cloud.rloki.mongodb.net/irrigation?retryWrites=true&w=majority&appName=mongodb-cloud';

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create MQTT Client
const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

// Create WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket Connections
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  // Handle Messages from WebSocket Clients
  ws.on('message', (message) => {
    handleWebSocketMessage(message);
  });

  // Send Welcome Message to New WebSocket Client
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server' }));
});

// Handle Incoming WebSocket Messages
function handleWebSocketMessage(message) {
  try {
    const data = JSON.parse(message);

    // Handle Pump Control Command
    if (data.type === 'control' && data.device === 'pump') {
      handlePumpControl(data.action);
    }
  } catch (error) {
    console.error('Error handling WebSocket message:', error);
  }
}

// Handle Pump Control Actions
function handlePumpControl(action) {
  let relayStatus;

  if (action === 'on') {
    relayStatus = true; // Relay ON
  } else if (action === 'off') {
    relayStatus = false; // Relay OFF
  }

  // Construct JSON Payload and Publish to MQTT
  const payload = JSON.stringify({ relayStatus: relayStatus });
  mqttClient.publish('garden/user/control', payload);
  console.log(`Pump control sent with relayStatus: ${relayStatus}`);
}

// Broadcast Data to All WebSocket Clients
function broadcastData(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Handle MQTT Connection Events
mqttClient.on('connect', () => {
  console.log('Connected to broker');

  // Subscribe to MQTT Topic
  const topic = 'garden/plant/metrics';
  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

// Handle Incoming MQTT Messages
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // Save Sensor Data to MongoDB
    const sensorData = new SensorData({
      temperature: data.temperature,
      humidity: data.humidity,
      soilMoisture: data.soilMoisture,
      timestamp: new Date(),
    });

    await sensorData.save();
    console.log('Document saved:', sensorData);

    // Broadcast Data to WebSocket Clients
    broadcastData(sensorData);

  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Handle MQTT Errors
mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});

// Handle MQTT Connection Closure
mqttClient.on('close', () => {
  console.log('MQTT Connection closed');
});
