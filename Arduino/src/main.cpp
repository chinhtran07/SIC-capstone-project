#include <Arduino.h>
#include <Relay.h>
#include <Sensor.h>
#include <LCD.h>
#include <UART.h>
#include <ArduinoJson.h>
#include <Ticker.h>

#define DHT_PIN 8
#define DHT_TYPE DHT11
#define SOIL_MOISTURE_PIN A0
#define RELAY_PIN 13
#define BUTTON_PIN 3
#define RX_PIN 10
#define TX_PIN 11
#define LCD_ADDRESS 0x27
#define LCD_COLUMNS 16
#define LCD_ROWS 2
#define MAX_TIMES 5

Sensor sensor(DHT_PIN, DHT_TYPE, SOIL_MOISTURE_PIN);
Relay relay(RELAY_PIN);
LCD lcd(LCD_ADDRESS, LCD_COLUMNS, LCD_ROWS);
UART uart(RX_PIN, TX_PIN);

const unsigned long debounceDelay = 50;        // 50ms debounce delay
const unsigned long timeWatering = 10 * 60000; // Thời gian tưới (10 phút)
const int moistureThreshold = 600;             // Threshold
volatile bool buttonPressed = false;
unsigned long lastDebounceTime = 0;
unsigned long timeBeginWatering = 0;
bool lastButtonState = HIGH;
bool isWatering = false;
int dataShow = 0;
float temperature = 0.0;
float humidity = 0.0;
JsonDocument doc;

void handleButtonPress();
void startWatering();
void stopWatering();
void sendData();
void sendPumpStatus();

Ticker timerSendData(sendData, 60000, 0, MILLIS);

void setup()
{
    Serial.begin(9600);
    uart.begin(9600);
    sensor.begin();
    relay.begin();
    lcd.setup();
    timerSendData.start();

    pinMode(BUTTON_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), handleButtonPress, CHANGE);
}

void loop()
{
    timerSendData.update();
    String signal;
    if (uart.receive(signal))
    {
        int control = signal.toInt();
        relay.setState(control);
        Serial.println(relay.getState() ? "ON" : "OFF");
        isWatering = control;
    }

    if (isWatering && (millis() - timeBeginWatering >= timeWatering))
    {
        stopWatering();
        return;
    }

    sensor.readSensors();
    temperature = sensor.getTemperature();
    humidity = sensor.getHumidity();
    int soilMoisture = sensor.getSoilMoisture();
    dataShow = map(soilMoisture, 0, 1024, 0, 100);

    if (isnan(temperature) || isnan(humidity))
    {
        lcd.displayData("DHT11 Error");
        Serial.println("DHT11 Error: Invalid data");
    }
    else
    {
        lcd.displayData(temperature, humidity, dataShow);
    }

    if (soilMoisture > moistureThreshold && !isWatering)
    {
        startWatering();
    }

    sendPumpStatus();

    delay(1000);
}

void handleButtonPress()
{
    unsigned long currentTime = millis();
    bool buttonState = digitalRead(BUTTON_PIN); // Read status of button

    if (buttonState != lastButtonState && (currentTime - lastDebounceTime) > debounceDelay)
    {
        lastDebounceTime = currentTime;

        if (buttonState == LOW)
        {
            relay.toggle();
            isWatering = relay.getState();
        }
    }

    lastButtonState = buttonState;
}

void startWatering()
{
    relay.setState(true);
    timeBeginWatering = millis();
    isWatering = true;
    Serial.println("Watering started.");
}

void stopWatering()
{
    relay.setState(false);
    isWatering = false;
    Serial.println("Watering completed.");
}

void sendData()
{
    doc.clear();
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["soil_moisture"] = dataShow;

    char json[128];
    serializeJson(doc, json);
    uart.send(json);
}

void sendPumpStatus()
{
    doc.clear();
    doc["relay_status"] = relay.getState();

    char json[128];
    serializeJson(doc, json);
    uart.send(json);
}