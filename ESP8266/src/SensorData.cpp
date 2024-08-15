#include "SensorData.h"

SensorData::SensorData(MQTTClient *client, Control *cs)
    : serial(D1, D2),
      mqttClient(client),
      control(cs),
      humidity(0.0),
      temperature(0.0),
      soilMoisture(0),
      lastPublishedStatus(false)
{
}

void SensorData::setup()
{
    serial.begin(9600);
}

bool SensorData::readDataFromUART()
{
    if (serial.available())
    {
        boolean message;
        String data = serial.readStringUntil('\n');
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, data);
        if (!error)
        {
            message = doc["message"];
            if (message)
            {
                humidity = doc["humidity"];
                temperature = doc["temperature"];
                soilMoisture = doc["soil_moisture"];
            }
            else
            {
                control->setStatus(doc["relay_status"], "At UART");
            }
            return true;
        }
        else
        {
            Serial.println(error.c_str());
        }
    }
    return false;
}

void SensorData::readAndPublish()
{
    if (readDataFromUART())
    {
        publishSensorData();
        publishControlStatus();
    }
}

void SensorData::publishSensorData()
{
    if (!humidity) {
        return;
    }
    JsonDocument doc;
    String payload;
    doc["humidity"] = humidity;
    doc["temperature"] = temperature;
    doc["soilMoisture"] = soilMoisture;

    serializeJson(doc, payload);
    mqttClient->publishMessage(TOPIC_METRICS, payload, true);
}

void SensorData::publishControlStatus()
{
    bool currentStatus = control->getStatus();
    if (currentStatus != lastPublishedStatus || control->hasChanged())
    {
        JsonDocument doc;
        String payload;

        doc["relayStatus"] = currentStatus;
        serializeJson(doc, payload);
        mqttClient->publishMessage(TOPIC_CONTROL, payload, true);

        Serial.println(currentStatus ? "ON" : "OFF");
        lastPublishedStatus = currentStatus;
        control->acknowledgeChange();
    }
}