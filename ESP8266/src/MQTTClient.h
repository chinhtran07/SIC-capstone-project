#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include "Config.h"
#include "Secret.h"
#include "Control.h"
#include "Threshold.h"

class MQTTClient {
private:
    WiFiClientSecure espClient;
    PubSubClient client;
    WiFiUDP wifiUdp;
    NTPClient timeClient;
    Control* controlStatus;
    Threshold* threshold;
    void reconnect();
    void messageReceived(char* topic, byte* payload, unsigned int length);

public:
    MQTTClient(Control* cs, Threshold* thres);
    void setup();
    void loop();
    void publishMessage(const char* topic, String payload, boolean retained);
};

extern MQTTClient* globalMqttClient;

#endif