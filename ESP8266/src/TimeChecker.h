#ifndef TIMECHECKER_H
#define TIMECHECKER_H

#include <EEPROM.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

class TimeChecker
{
private:
    unsigned long timer1;
    unsigned long timer2;
    unsigned long timer3;
    bool isWatering;

    NTPClient *timeClient;
    WiFiUDP *wifiUdp;

    const int TIMER1_ADDRESS;
    const int TIMER2_ADDRESS;
    const int TIMER3_ADDRESS;

public:
    TimeChecker(NTPClient *ntpClient, int timer1Addr, int timer2Addr, int timer3Addr);

    void begin();
    void checkTimers(void (*startWatering)(), void (*stopWatering)());
    void setTimers(unsigned long t1, unsigned long t2, unsigned long t3);
    void saveTimersToEEPROM();
};

#endif
