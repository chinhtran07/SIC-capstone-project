#include "UART.h"

UART::UART(uint8_t rxPin, uint8_t txPin) {
  mySerial = new SoftwareSerial(rxPin, txPin);
}

void UART::begin(unsigned long baudRate) {
  mySerial->begin(baudRate);
}

void UART::send(const String message) {
  mySerial->println(message);
}

bool UART::receive(String &signal) {
  if (mySerial->available()) {
    signal = mySerial->readStringUntil('\n');
    return true;
  }
  return false;
}
