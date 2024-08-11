#ifndef LCD_H
#define LCD_H

#include <LiquidCrystal_I2C.h>

class LCD
{
private:
    LiquidCrystal_I2C* lcd;

public:
    LCD(uint8_t address, uint8_t columns, uint8_t rows);
    void setup();
    void displayData(float temperature, float humidity, int soilMoisture);
    void displayData(const char *message);
};

#endif