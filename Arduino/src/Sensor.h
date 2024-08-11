#ifndef SENSOR_H
#define SENSOR_H

#include <DHT.h>

class Sensor {
  private:
    DHT* dht;
    uint8_t soilMoisturePin;
    float temperature;
    float humidity;
    int soilMoisture;

  public:
    Sensor (uint8_t dhtPin, uint8_t dhtType, uint8_t soilMoisturePin);
    void begin();
    void readSensors();
    float getTemperature();
    float getHumidity();
    int getSoilMoisture();
};

#endif
