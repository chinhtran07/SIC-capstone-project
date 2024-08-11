#include "Sensor.h"

Sensor::Sensor(uint8_t dhtPin, uint8_t dhtType, uint8_t soilMoisturePin) {
  dht = new DHT(dhtPin, dhtType);
  this->soilMoisturePin = soilMoisturePin;
}

void Sensor::begin() {
  dht->begin();
}

void Sensor::readSensors() {
  temperature = dht->readTemperature();
  humidity = dht->readHumidity();
  soilMoisture = analogRead(soilMoisturePin);
}

float Sensor::getTemperature() {
  return temperature;
}

float Sensor::getHumidity() {
  return humidity;
}

int Sensor::getSoilMoisture() {
  return soilMoisture;
}
