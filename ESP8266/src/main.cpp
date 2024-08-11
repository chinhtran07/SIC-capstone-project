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
#define TOPIC_METRICS "garden/plant/metrics"
#define TOPIC_TIMERS "garden/plant/timers"
#define EEPROM_SIZE 64
#define TIMER1_ADDRESS 0
#define TIMER2_ADDRESS 4
#define TIMER3_ADDRESS 8
#define BOOT_STATUS_ADDRESS 12 // Địa chỉ EEPROM lưu trạng thái boot

SoftwareSerial serial(D1, D2);
float humidity = 0.0, temperature = 0.0;
int soilMoisture = 0;
bool previousStatus = false;
bool controlStatus = false;
unsigned long timer1, timer2, timer3;
unsigned long currentMillis;
bool isWatering = false;
bool isFirstBoot; // Biến cờ cho lần khởi động đầu tiên

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

  EEPROM.begin(EEPROM_SIZE);

  // Đọc trạng thái boot từ EEPROM
  if (EEPROM.read(BOOT_STATUS_ADDRESS) == 0xFF)
  {
    isFirstBoot = true;
    EEPROM.write(BOOT_STATUS_ADDRESS, 0); // Đánh dấu rằng đã khởi động lần đầu tiên
    EEPROM.commit();
  }
  else
  {
    isFirstBoot = false;
  }

  setupWiFi();
  timeClient.begin();

  timeClient.update();
  Serial.print("Current time: ");
  Serial.println(timeClient.getFormattedTime());

  // Khởi tạo biến thời gian từ EEPROM chỉ khi không phải là lần khởi động đầu tiên
  if (!isFirstBoot)
  {
    if (EEPROM.read(TIMER1_ADDRESS) != 0xFF)
    {
      EEPROM.get(TIMER1_ADDRESS, timer1);
    }

    if (EEPROM.read(TIMER2_ADDRESS) != 0xFF)
    {
      EEPROM.get(TIMER2_ADDRESS, timer2);
    }

    if (EEPROM.read(TIMER3_ADDRESS) != 0xFF)
    {
      EEPROM.get(TIMER3_ADDRESS, timer3);
    }
  }

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
    doc["humidity"] = humidity;
    doc["temperature"] = temperature;
    doc["soil_moisture"] = soilMoisture;

    String payload;
    serializeJson(doc, payload);
    publishMessage(TOPIC_METRICS, payload, true);
  }

  // Chỉ kiểm tra timer nếu không phải lần khởi động đầu tiên
  // if (!isFirstBoot)
  // {
  //   checkTimers();
  // }
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
      client.subscribe(TOPIC_CONTROL);
      client.subscribe(TOPIC_TIMERS);
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

  if (strcmp(topic, TOPIC_CONTROL) == 0)
  {
    controlStatus = doc["relay_status"];
    serial.println(controlStatus);
    previousStatus = controlStatus;
    isWatering = controlStatus;
    Serial.println(controlStatus ? "RELAY ON" : "RELAY OFF");
  }

  if (strcmp(topic, TOPIC_TIMERS) == 0)
  {
    timer1 = doc["timer1"];
    timer2 = doc["timer2"];
    timer3 = doc["timer3"];

    EEPROM.put(TIMER1_ADDRESS, timer1);
    EEPROM.put(TIMER2_ADDRESS, timer2);
    EEPROM.put(TIMER3_ADDRESS, timer3);
    EEPROM.commit();

    Serial.print("Timers saved (millis): ");
    Serial.print(timer1);
    Serial.print(", ");
    Serial.print(timer2);
    Serial.print(", ");
    Serial.println(timer3);

    // Đặt cờ là không phải lần khởi động đầu tiên sau khi nhận thời gian
    isFirstBoot = false;
    EEPROM.write(BOOT_STATUS_ADDRESS, 0); // Đánh dấu trạng thái đã được thiết lập
    EEPROM.commit();
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

      // Cập nhật trạng thái relay qua MQTT nếu có sự thay đổi
      if (controlStatus != previousStatus)
      {
        previousStatus = controlStatus;
        isWatering = controlStatus;
        String payload;
        serializeJson(doc, payload);
        publishMessage(TOPIC_CONTROL, payload, true);
        Serial.println(controlStatus ? "RELAY ON" : "RELAY OFF");
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