#ifndef MyAPI_h
#define MyAPI_h

#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

class MyAPI {
public:
    MyAPI(String serverUrl);
    void get(const char* endpoint, WiFiClient& client,void (*callback)(String));
    void post(const char* endpoint, WiFiClient& client ,const String& payload, void (*callback)(String));
    void setHeaders(const String& headers);
    void parseJson(String response, JsonDocument &doc);

private:
    String _serverUrl;
    String _headers;
};

#endif
