#ifndef THRESHOLD_H
#define THRESHOLD_H

class Threshold {
    private:
        float humidity;
        float temperature;
        float soilMoisture;

    public:
        Threshold();
        void setThreshold(float humidity, float temperature, float soilMoisture);
        bool isOverThreshold(float humidity, float temperature, float soilMoisture);
};

#endif