#include <Threshold.h>
#include <Arduino.h>

Threshold::Threshold() {

}

void Threshold::setThreshold(float humidity, float temperature, float soilMoisture) {
    this->humidity = humidity;
    this->temperature = temperature;
    this->soilMoisture = soilMoisture;
}

bool Threshold::isOverThreshold(float humidity, float temperature, float soilMoisture) {
    if (humidity < this->humidity) {
        Serial.println("Threshold Humidity");
        return true;
    }
    if (temperature > this->temperature) {
        Serial.println("Threshold temperature");
        return true;
    }
    if (soilMoisture < this->soilMoisture) {
        Serial.println("Threshold Soil Moisture");
        return true;
    }
    
    return false;
}