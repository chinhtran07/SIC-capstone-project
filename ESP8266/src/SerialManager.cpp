#ifndef SERIAL_MANAGER_H
#define SERIAL_MANAGER

#include <SoftwareSerial.h>

class SerialManager {
public:
    static SoftwareSerial& getInstance() {
        static SoftwareSerial instance(D1, D2); // Chỉ được tạo một lần
        return instance;
    }

private:
    // Đảm bảo các phương thức khởi tạo và sao chép không thể sử dụng từ bên ngoài
    SerialManager() {}
    SerialManager(const SerialManager&) = delete;
    void operator=(const SerialManager&) = delete;
};

#endif
