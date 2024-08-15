#include "MyAPI.h"

MyAPI::MyAPI(String serverUrl, WiFiClient client) : client(client)
{
    _serverUrl = serverUrl;
}

void MyAPI::get(const char *endpoint, void (*callback)(String))
{
    HTTPClient http;
    String url = String(_serverUrl) + String(endpoint);
    Serial.println(url);
    http.begin(client, url);
    if (_headers.length() > 0)
    {
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Custom-Header", _headers);
    }
    int httpResponseCode = http.GET();
    String response = "";

    if (httpResponseCode > 0)
    {
        response = http.getString();
    }
    else
    {
        Serial.print("Error on HTTP request: ");
        Serial.println(httpResponseCode);
    }
    http.end();

    // Gọi hàm callback với dữ liệu trả về
    if (callback != nullptr)
    {
        callback(response);
    }
}

void MyAPI::post(const char *endpoint, const String &payload, void (*callback)(String))
{
        HTTPClient http;
        String url = String(_serverUrl) + String(endpoint);
        http.begin(client ,url.c_str());
        if (_headers.length() > 0)
        {
            http.addHeader("Content-Type", "application/json");
            http.addHeader("Custom-Header", _headers);
        }
        int httpResponseCode = http.POST(payload);
        String response = "";

        if (httpResponseCode > 0)
        {
            response = http.getString();
        }
        else
        {
            Serial.print("Error on HTTP request: ");
            Serial.println(httpResponseCode);
        }
        http.end();

        // Gọi hàm callback với dữ liệu trả về
        if (callback != nullptr)
        {
            callback(response);
        }
}

void MyAPI::setHeaders(const String &headers)
{
    _headers = headers;
}

void MyAPI::parseJson(String response, JsonDocument &doc) {
    DeserializationError error = deserializeJson(doc, response);
      if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
      }
}