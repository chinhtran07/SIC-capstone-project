#include "Config.h"
#include "WiFiSetup.h"
#include "MQTTClient.h"
#include "SensorData.h"
#include "Control.h"

WiFiSetup wifiSetup;
Control controlStatus;
MQTTClient mqttClient(&controlStatus);
SensorData sensorData(&mqttClient, &controlStatus);

void setup() {
    Serial.begin(115200);

    wifiSetup.setupWiFi();
    mqttClient.setup();
    sensorData.setup();
}

void loop() {
    mqttClient.loop();
    sensorData.readAndPublish();
}