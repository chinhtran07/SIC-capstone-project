#include <Arduino.h>
#include <Relay.h>
#include <Sensor.h>
#include <LCD.h>
#include <UART.h>
#include <ArduinoJson.h>

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

Sensor sensor(DHT_PIN, DHT_TYPE, SOIL_MOISTURE_PIN);
Relay relay(RELAY_PIN);
LCD lcd(LCD_ADDRESS, LCD_COLUMNS, LCD_ROWS);
UART uart(RX_PIN, TX_PIN);

const unsigned long DEBOUNCE_DELAY = 50;        // 50ms debounce delay
const unsigned long TIME_WATERING = 10 * 60000; // Thời gian tưới (10 phút)
const int MOISTURE_THRESHOLD = 600;             // Threshold

unsigned long lastDebounceTime = 0;
unsigned long timeBeginWatering = 0;
bool lastButtonState = HIGH;
bool isWatering = false;
int dataShow = 0;
JsonDocument doc;

void handleButtonPress();
void startWatering();
void stopWatering();
void updateLCD(float temperature, float humidity, int soilMoisture);
void sendJSONData(float temperature, float humidity, int soilMoisture, bool relayStatus);

void setup()
{
    Serial.begin(9600);
    uart.begin(9600);
    sensor.begin();
    relay.begin();
    lcd.setup();

    pinMode(BUTTON_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), handleButtonPress, CHANGE);
}

void loop()
{
    // Xử lý nhận dữ liệu từ UART
    String signal;
    if (uart.receive(signal))
    {
        int control = signal.toInt();
        relay.setState(control);
        Serial.println(relay.getState() ? "ON" : "OFF");
        isWatering = control;
    }

    // Dừng tưới nếu thời gian tưới đã hết
    if (isWatering && (millis() - timeBeginWatering >= TIME_WATERING))
    {
        stopWatering();
        return;
    }

    // Đọc dữ liệu từ cảm biến
    sensor.readSensors();
    float temperature = sensor.getTemperature();
    float humidity = sensor.getHumidity();
    int soilMoisture = sensor.getSoilMoisture();
    dataShow = map(soilMoisture, 0, 1024, 0, 100);

    // Cập nhật LCD và gửi dữ liệu qua UART
    if (isnan(temperature) || isnan(humidity))
    {
        lcd.displayData("DHT11 Error");
        Serial.println("DHT11 Error: Invalid data");
    }
    else
    {
        updateLCD(temperature, humidity, dataShow);
        sendJSONData(temperature, humidity, dataShow, relay.getState());
    }

    // Kiểm tra độ ẩm đất và bắt đầu tưới nếu cần
    if (soilMoisture > MOISTURE_THRESHOLD && !isWatering)
    {
        startWatering();
    }

    delay(1000);
}

void handleButtonPress()
{
    unsigned long currentTime = millis();
    bool buttonState = digitalRead(BUTTON_PIN);

    if (buttonState != lastButtonState && (currentTime - lastDebounceTime) > DEBOUNCE_DELAY)
    {
        lastDebounceTime = currentTime;

        if (buttonState == LOW)
        {
            relay.toggle();
            isWatering = relay.getState();
            sendJSONData(0, 0, 0, relay.getState()); // Cập nhật trạng thái relay
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

void updateLCD(float temperature, float humidity, int soilMoisture)
{
    lcd.displayData(temperature, humidity, soilMoisture);
}

void sendJSONData(float temperature, float humidity, int soilMoisture, bool relayStatus)
{
    doc.clear();
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["soil_moisture"] = soilMoisture;
    doc["relay_status"] = relayStatus;

    char json[128];
    serializeJson(doc, json);
    uart.send(json);
}
