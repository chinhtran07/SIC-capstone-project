module.exports = {
    brokerUrl: process.env.MQTT_BROKER_URL,
    options: {
      port: process.env.MQTT_PORT,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    },
  };
  