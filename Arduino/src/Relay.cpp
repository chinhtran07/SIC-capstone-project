  #include "Relay.h"
  #include <Arduino.h>

  Relay::Relay(int relayPin) : relayPin(relayPin), relayState(false) {}

  void Relay::begin() {
    pinMode(relayPin, OUTPUT);
    digitalWrite(relayPin, LOW);
  }

  void Relay::toggle() {
    relayState = !relayState;
    digitalWrite(relayPin, relayState ? HIGH : LOW);
  }

  void Relay::setState(bool state) {
    relayState = state;
    digitalWrite(relayPin, relayState ? HIGH : LOW);
  }

  bool Relay::getState() {
    return relayState;
  }
