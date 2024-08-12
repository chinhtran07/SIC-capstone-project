#include <Arduino.h>
#include <SoftwareSerial.h>
#include <WiFiManager.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Secret.h>
#include <EEPROM.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

#define TOPIC_CONTROL "garden/plant/control"
#define TOPIC_USER_CONTROL "garden/user/control"
#define TOPIC_METRICS "garden/plant/metrics"
#define TOPIC_LIMIT "garden/plant/limit"

SoftwareSerial serial(D1, D2);
float humidity = 0.0, temperature = 0.0;
int soilMoisture = 0;
bool previousStatus = false;
bool controlStatus = false;

WiFiClientSecure espClient;
PubSubClient client(espClient);
WiFiUDP wifiUdp;
NTPClient timeClient(wifiUdp, 7 * 3600);

void setupWiFi();
void reconnect();
void messageReceived(char *topic, byte *payload, unsigned int length);
void publishMessage(const char *topic, String payload, boolean retained);
bool readDataFromUART();

void setup()
{
  Serial.begin(115200);
  serial.begin(9600);

  setupWiFi();
  timeClient.begin();

  timeClient.update();
  Serial.print("Current time: ");
  Serial.println(timeClient.getFormattedTime());

  espClient.setInsecure();
  client.setServer(__MQTT_SERVER__, __MQTT_PORT__);
  client.setCallback(messageReceived);
  reconnect();
}

void loop()
{
  if (!client.connected())
  {
    reconnect();
  }

  client.loop();

  if (readDataFromUART())
  {
    JsonDocument doc;
    String payload;
    if (soilMoisture != 0)
    {
      doc["humidity"] = humidity;
      doc["temperature"] = temperature;
      doc["soilMoisture"] = soilMoisture;

      serializeJson(doc, payload);
      publishMessage(TOPIC_METRICS, payload, true);
    }

    if (controlStatus != previousStatus)
    {
      doc.clear();
      previousStatus = controlStatus;
      doc["relayStatus"] = controlStatus;
      serializeJson(doc, payload);
      publishMessage(TOPIC_CONTROL, payload, true);
      Serial.println(controlStatus ? "RELAY ON" : "RELAY OFF");
    }
  }
}

void setupWiFi()
{
  WiFiManager wm;

  Serial.print("Connecting");
  while (!wm.autoConnect("ESP8266"))
  {
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected");
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client", __MQTT_USER__, __MQTT_PASSWORD__))
    {
      Serial.println("connected");
      client.subscribe(TOPIC_USER_CONTROL);
      client.subscribe(TOPIC_LIMIT);
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void messageReceived(char *topic, byte *payload, unsigned int length)
{
  payload[length] = '\0';
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error)
  {
    Serial.println("Failed to parse JSON");
    return;
  }

  if (strcmp(topic, TOPIC_USER_CONTROL) == 0)
  {
    String controlData;
    controlStatus = doc["relayStatus"];
    serializeJson(doc, controlData);
    serial.println(controlStatus);
    previousStatus = controlStatus;
    Serial.println(controlStatus ? "RELAY ON" : "RELAY OFF");
  }

  if (strcmp(topic, TOPIC_LIMIT) == 0) {
    String limitData;
    serializeJson(doc, limitData);
    serial.println(limitData);
  }
}

void publishMessage(const char *topic, String payload, boolean retained)
{
  if (client.connected())
  {
    client.publish(topic, payload.c_str(), retained);
  }
}

bool readDataFromUART()
{
  if (serial.available())
  {
    String data = serial.readStringUntil('\n');
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, data);
    if (!error)
    {
      humidity = doc["humidity"];
      temperature = doc["temperature"];
      soilMoisture = doc["soil_moisture"];
      controlStatus = doc["relay_status"];

      return true;
    }
    else
    {
      Serial.println(error.c_str());
    }
  }
  return false;
}