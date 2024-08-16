#include "SensorData.h"
#include "SerialManager.cpp"

SensorData::SensorData(MQTTClient *client, Control *cs, Threshold *th)
    : mqttClient(client),
      threshold(th),
      control(cs),
      humidity(0.0),
      temperature(0.0),
      soilMoisture(0),
      lastControlStatus(false),
      lastTime(0)

{
}

void SensorData::setup()
{
    SoftwareSerial &serial = SerialManager::getInstance();
    serial.begin(9600);
}

bool SensorData::readDataFromUART()
{
    SoftwareSerial &serial = SerialManager::getInstance();
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
                if (threshold->isOverThreshold(humidity, temperature, soilMoisture)) {
                    control->setStatus(true, "IsOverUART");
                    serial.println(control->getStatus());
                }
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
        if (millis() - lastTime >= interval) {
            publishSensorData();
            lastTime = millis();
        }
        publishControlStatus();
    }
}

void SensorData::publishSensorData()
{
    if (!humidity)
    {
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
    if (currentStatus != lastControlStatus || control->hasChanged()) {
    JsonDocument doc;
    String payload;

    doc["relayStatus"] = currentStatus;
    lastControlStatus = currentStatus;
    serializeJson(doc, payload);
    mqttClient->publishMessage(TOPIC_CONTROL, payload, true);

    Serial.println(currentStatus ? "ON" : "OFF");
    control->acknowledgeChange();
    }
}