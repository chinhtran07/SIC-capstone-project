#include "MQTTClient.h"
#include <ArduinoJson.h>
#include <SerialManager.cpp>

MQTTClient* globalMqttClient = nullptr;

MQTTClient::MQTTClient(Control* cs, Threshold* thres) 
    : client(espClient), timeClient(wifiUdp, 7 * 3600), controlStatus(cs), threshold(thres){
    globalMqttClient = this;
}

void MQTTClient::setup() {
    timeClient.begin();
    timeClient.update();
    Serial.print("Current time: ");
    Serial.println(timeClient.getFormattedTime());

    espClient.setInsecure();
    client.setServer(__MQTT_SERVER__, __MQTT_PORT__);
    client.setCallback([this](char* topic, byte* payload, unsigned int length) {
        this->messageReceived(topic, payload, length);
    });
    reconnect();

    SoftwareSerial &serial = SerialManager::getInstance();
    serial.begin(9600);
}

void MQTTClient::loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
}

void MQTTClient::reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (client.connect("ESP8266Client", __MQTT_USER__, __MQTT_PASSWORD__)) {
            Serial.println("connected");
            client.subscribe(TOPIC_USER_CONTROL);
            client.subscribe(TOPIC_LIMIT);
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void MQTTClient::messageReceived(char* topic, byte* payload, unsigned int length) {
    payload[length] = '\0';
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
        Serial.println("Failed to parse JSON");
        return;
    }

    if (strcmp(topic, TOPIC_USER_CONTROL) == 0) {
        SoftwareSerial &serial = SerialManager::getInstance();
        bool newStatus = doc["relayStatus"];
        controlStatus->setStatus(newStatus, "At MQTT");
        controlStatus->acknowledgeChange();
        serial.println(newStatus);
        Serial.println(newStatus ? "RELAY ON" : "RELAY OFF");
        serial.println(newStatus);
    }

    if (strcmp(topic, TOPIC_LIMIT) == 0) {
        threshold->setThreshold(doc["humidity"], doc["temperature"], doc["soilMoisture"]);
        float test = doc["humidity"];
        Serial.println(test);
    }
}

void MQTTClient::publishMessage(const char* topic, String payload, boolean retained) {
    if (client.connected()) {
        client.publish(topic, payload.c_str(), retained);
    }
}