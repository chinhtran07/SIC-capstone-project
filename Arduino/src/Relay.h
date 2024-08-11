#ifndef RELAY_H
#define RELAY_H

class Relay {
  private:
    int relayPin;
    bool relayState;

  public:
    Relay(int relayPin);
    void begin();
    void toggle();
    void setState(bool state);
    bool getState();
};

#endif
