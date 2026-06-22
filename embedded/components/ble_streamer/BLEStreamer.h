#ifndef BLE_STREAMER_H
#define BLE_STREAMER_H

#include <Arduino.h>

// @implements FA2.5
bool initBLE();

// @implements FA2.5
void streamIMUData(float ax, float ay, float az, float gx, float gy, float gz);

#endif // BLE_STREAMER_H
