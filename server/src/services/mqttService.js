const mqtt = require('mqtt');
const mqttConfig = require('../configs/mqttConfig');
const mqttController = require('../controllers/mqttController');

let mqttClient;

exports.init = () => {
  mqttClient = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);
  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(['garden/plant/metrics', 'garden/plant/control'], (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log('Subscribed to MQTT topics');
      }
    });
  });

  mqttClient.on('message', mqttController.handleMessage);

  mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
  });

  mqttClient.on('close', () => {
    console.log('MQTT Connection closed');
  });
};

exports.handlePumpControl = (action) => {
  let relayStatus;

  if (action === 'on') {
    relayStatus = true; // Relay ON
  } else if (action === 'off') {
    relayStatus = false; // Relay OFF
  }

  // Construct JSON Payload and Publish to MQTT
  const payload = JSON.stringify({message: "control" ,relayStatus: relayStatus });
  mqttClient.publish('garden/user/control', payload);
  console.log(`Pump control sent with relayStatus: ${relayStatus}`);
};

exports.publish = (topic, payload) => {
  mqttClient.publish(topic,payload);
}