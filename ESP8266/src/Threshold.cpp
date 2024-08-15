#include <Threshold.h>

Threshold::Threshold() {

}

void Threshold::setThreshold(float humidity, float temperature, float soilMoisture) {
    this->humidity = humidity;
    this->temperature = temperature;
    this->soilMoisture = soilMoisture;
}

bool Threshold::isOverThreshold(float humidity, float temperature, float soilMoisture) {
    if (humidity < this->humidity)
        return true;
    if (temperature > this->temperature)
        return true;
    if (soilMoisture > this->soilMoisture)
        return true;
    
    return false;
}