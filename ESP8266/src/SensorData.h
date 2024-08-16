#ifndef SENSOR_DATA_H
#define SENSOR_DATA_H

#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include "MQTTClient.h"
#include "Control.h"

class SensorData {
private:
    float humidity, temperature;
    int soilMoisture;
    MQTTClient* mqttClient;
    Control* control;
    Threshold* threshold;
    bool lastControlStatus;
    unsigned long lastTime;
    unsigned long interval = 60000;

    bool readDataFromUART();
    void publishSensorData();
    void publishControlStatus();
public:
    SensorData(MQTTClient* client, Control* cs, Threshold* threshold);
    void setup();
    void readAndPublish();
};

#endif