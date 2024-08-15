#include "Control.h"

Control::Control() : status(false), changed(false) {}

void Control::setStatus(bool newStatus, String message) {
    if (newStatus != status) {
        status = newStatus;
        changed = true;
        Serial.println(message);
    }
}

bool Control::getStatus() const {
    return status;
}

bool Control::hasChanged() {
    return changed;
}

void Control::acknowledgeChange() {
    changed = false;
}