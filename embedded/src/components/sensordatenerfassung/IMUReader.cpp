// @implements FA2.1, NF1
#include "IMUReader.h"
#include <LSM6DS3.h>
#include <Wire.h>

#define CONVERT_G_TO_MS2    9.80665f
#define MAX_ACCEPTED_RANGE  2.0f

static LSM6DS3 myIMU(I2C_MODE, 0x6A);

static float ei_get_sign(float number) {
    return (number >= 0.0) ? 1.0 : -1.0;
}

// @implements FA2.1, NF1
bool initIMU() {
    return myIMU.begin();
}

// @implements FA2.1, NF1
void readSensorData(float* buffer, size_t startIndex) {

    // 1. Beschleunigung einlesen
    // @implements FA2.1
    buffer[startIndex + 0] = myIMU.readFloatAccelX();
    buffer[startIndex + 1] = myIMU.readFloatAccelY();
    buffer[startIndex + 2] = myIMU.readFloatAccelZ();

    // 2. Gyroskop einlesen
    // @implements FA2.1
    buffer[startIndex + 3] = myIMU.readFloatGyroX();
    buffer[startIndex + 4] = myIMU.readFloatGyroY();
    buffer[startIndex + 5] = myIMU.readFloatGyroZ();

    // Clamping & Umrechnung nur für die Beschleunigungs-Achsen (Index 0 bis 2)
    for (int i = 0; i < 3; i++) {
        if (fabs(buffer[startIndex + i]) > MAX_ACCEPTED_RANGE) {
            buffer[startIndex + i] = ei_get_sign(buffer[startIndex + i]) * MAX_ACCEPTED_RANGE;
        }
        buffer[startIndex + i] *= CONVERT_G_TO_MS2;
    }
}
