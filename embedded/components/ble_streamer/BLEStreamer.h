#ifndef BLE_STREAMER_H
#define BLE_STREAMER_H

#include <Arduino.h>

// @implements FA3, FA5
bool initBLE();

// @implements FA5
void streamIMUData(float ax, float ay, float az, float gx, float gy, float gz);

#endif // BLE_STREAMER_H
