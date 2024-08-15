#include "WiFiSetup.h"

void WiFiSetup::setupWiFi() {
  WiFiManager wm;

  Serial.print("Connecting");
  while (!wm.autoConnect("ESP8266")) {
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected");
}