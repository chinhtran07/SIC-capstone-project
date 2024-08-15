#include "Config.h"
#include "WiFiSetup.h"
#include "MQTTClient.h"
#include "SensorData.h"
#include "Control.h"
#include "Threshold.h"
#include "MyAPI.h"

const String url = "http://192.168.2.14:3000/api";

WiFiClientSecure client;
WiFiSetup wifiSetup;
Control controlStatus;
Threshold threshold;
MyAPI myAPI(url, client);
MQTTClient mqttClient(&controlStatus, &threshold);
SensorData sensorData(&mqttClient, &controlStatus);

void handleThreshold(String response);
void getThreshold();

void setup() {
    Serial.begin(115200);

    wifiSetup.setupWiFi();
    mqttClient.setup();
    client.setInsecure();
    myAPI.get("/threshold", handleThreshold);
    // getThreshold();
    sensorData.setup();
}

void loop() {
    mqttClient.loop();
    sensorData.readAndPublish();
}

void handleThreshold(String response) {
    JsonDocument doc;
    Serial.println(response);
    myAPI.parseJson(response, doc);
    threshold.setThreshold(doc["humidity"], doc["temperature"], doc["soilMoisture"]);
}

void getThreshold()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    http.begin(client, url);

    int httpCode = http.GET();
    if (httpCode > 0)
    {
      String payload = http.getString();
      // Phân tích JSON và cập nhật ngưỡng
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, payload);
      if (!error)
      {
        Serial.println("GOT IT");
      }
      else
      {
        Serial.println("Failed to parse JSON");
      }
    }
    else
    {
      Serial.printf("HTTP GET failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }
  else
  {
    Serial.println("WiFi not connected");
  }
}