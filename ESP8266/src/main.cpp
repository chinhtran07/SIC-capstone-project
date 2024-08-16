#include "Config.h"
#include "WiFiSetup.h"
#include "MQTTClient.h"
#include "SensorData.h"
#include "Control.h"
#include "Threshold.h"
#include "MyAPI.h"

const String url = "http://192.168.2.14:3000/api";

WiFiClient client;
WiFiSetup wifiSetup;
Control controlStatus;
Threshold threshold;
MyAPI myAPI(url);
MQTTClient mqttClient(&controlStatus, &threshold);
SensorData sensorData(&mqttClient, &controlStatus);

void handleThreshold(String response);
void getThreshold();

void setup()
{
  Serial.begin(115200);

  WiFiManager wifiManager;

  // Automatically connect using saved credentials or start the configuration portal
  if (!wifiManager.autoConnect("AutoConnectAP", "password")) {
    Serial.println("Failed to connect. Resetting...");
    delay(3000);
    ESP.restart();
  }

  Serial.println("Connected to Wi-Fi");

  WiFi.begin(WiFi.SSID(), WiFi.psk());
  if (WiFi.status() == WL_CONNECTED)
    myAPI.get("/threshold", client, handleThreshold);

  mqttClient.setup();
  sensorData.setup();

}

void loop()
{
  mqttClient.loop();
  sensorData.readAndPublish();
  threshold.isOverThreshold();
}

void handleThreshold(String response)
{
  JsonDocument doc;
  Serial.println(response);
  myAPI.parseJson(response, doc);
  threshold.setThreshold(doc["humidity"], doc["temperature"], doc["soilMoisture"]);
}
