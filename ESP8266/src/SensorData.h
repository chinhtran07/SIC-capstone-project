#ifndef SENSOR_DATA_H
#define SENSOR_DATA_H

#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include "MQTTClient.h"
#include "Control.h"

class SensorData {
private:
    SoftwareSerial serial;
    float humidity, temperature;
    int soilMoisture;
    MQTTClient* mqttClient;
    Control* control;
    bool lastPublishedStatus;

    bool readDataFromUART();
    void publishSensorData();
    void publishControlStatus();
public:
    SensorData(MQTTClient* client, Control* cs);
    void setup();
    void readAndPublish();
};

#endif