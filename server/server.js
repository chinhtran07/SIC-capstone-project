require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const mqttService = require('./src/services/mqttService');
const websocketService = require('./src/services/websocketService');
const mongoDB = require('./src/configs/mongoConfig');

mongoDB.connectDB();

const server = http.createServer(app);

mqttService.init();
websocketService.init();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
