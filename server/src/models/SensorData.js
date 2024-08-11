const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const uri = 'mongodb+srv://chinht1807:Chinhtran18@mongodb-cloud.rloki.mongodb.net/irrigation?retryWrites=true&w=majority&appName=mongodb-cloud';

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a schema for SensorData
const sensorDataSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  soilMoisture: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create a model based on the schema
const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;
