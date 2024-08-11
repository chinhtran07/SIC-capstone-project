#ifndef UART_H
#define UART_H

#include <SoftwareSerial.h>

class UART {
  private:
    SoftwareSerial* mySerial;

  public:
    UART(uint8_t rxPin, uint8_t txPin);
    void begin(unsigned long baudRate);
    void send(const String message);
    bool receive(String &signal);
};

#endif
