#include "LCD.h"
#include <Wire.h>

LCD::LCD(uint8_t address, uint8_t columns, uint8_t rows) {
    lcd = new LiquidCrystal_I2C(address, columns, rows);
}

void LCD::setup()
{
    lcd->init();
    lcd->backlight();
}

void LCD::displayData(float temperature, float humidity, int soilMoisture)
{
    lcd->clear();
    lcd->setCursor(0, 0);
    lcd->print("T:");
    lcd->print(temperature);
    lcd->print("C ");
    lcd->print("S: ");
    lcd->print(soilMoisture);
    lcd->print("%");
    lcd->setCursor(0, 1);
    lcd->print("H:");
    lcd->print(humidity);
    lcd->print("%");
}

void LCD::displayData(const char* message) {
  lcd->clear();
  lcd->setCursor(0, 0);
  lcd->print(message);
}