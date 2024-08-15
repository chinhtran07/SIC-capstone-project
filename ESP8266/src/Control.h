#ifndef CONTROL_STATUS_H
#define CONTROL_STATUS_H

#include <Arduino.h>

class Control {
private:
    bool status;
    bool changed;

public:
    Control();
    void setStatus(bool newStatus, String message);
    bool getStatus() const;
    bool hasChanged();
    void acknowledgeChange();
};

#endif