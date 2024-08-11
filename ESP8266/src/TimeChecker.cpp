#include "TimeChecker.h"

TimeChecker::TimeChecker(NTPClient *ntpClient, int timer1Addr, int timer2Addr, int timer3Addr)
    : timeClient(ntpClient), TIMER1_ADDRESS(timer1Addr), TIMER2_ADDRESS(timer2Addr), TIMER3_ADDRESS(timer3Addr), isWatering(false)
{
    wifiUdp = new WiFiUDP();
}

void TimeChecker::begin()
{
    EEPROM.begin(64);

    // Đọc giá trị timer từ EEPROM
    EEPROM.get(TIMER1_ADDRESS, timer1);
    EEPROM.get(TIMER2_ADDRESS, timer2);
    EEPROM.get(TIMER3_ADDRESS, timer3);

    timeClient->begin();
}

void TimeChecker::checkTimers(void (*startWatering)(), void (*stopWatering)())
{
    unsigned long currentMillis = timeClient->getEpochTime();
    bool needWatering = false;

    if (currentMillis >= timer1 && !isWatering)
    {
        needWatering = true;
        timer1 = currentMillis + 86400;
        EEPROM.put(TIMER1_ADDRESS, timer1);
        EEPROM.commit();
    }
    if (currentMillis >= timer2 && !isWatering)
    {
        needWatering = true;
        timer2 = currentMillis + 86400;
        EEPROM.put(TIMER2_ADDRESS, timer2);
        EEPROM.commit();
    }
    if (currentMillis >= timer3 && !isWatering)
    {
        needWatering = true;
        timer3 = currentMillis + 86400;
        EEPROM.put(TIMER3_ADDRESS, timer3);
        EEPROM.commit();
    }

    if (needWatering && !isWatering)
    {
        startWatering();
        isWatering = true;
    }
    else if (!needWatering && isWatering)
    {
        stopWatering();
        isWatering = false;
    }
}

void TimeChecker::setTimers(unsigned long t1, unsigned long t2, unsigned long t3)
{
    timer1 = t1;
    timer2 = t2;
    timer3 = t3;
    saveTimersToEEPROM();
}

void TimeChecker::saveTimersToEEPROM()
{
    EEPROM.put(TIMER1_ADDRESS, timer1);
    EEPROM.put(TIMER2_ADDRESS, timer2);
    EEPROM.put(TIMER3_ADDRESS, timer3);
    EEPROM.commit();
}
