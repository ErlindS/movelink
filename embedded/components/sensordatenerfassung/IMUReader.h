#ifndef IMU_READER_H
#define IMU_READER_H

#include <Arduino.h>

// @implements FA5, NF1
bool initIMU();

// @implements FA5, NF1
void readSensorData(float* buffer, size_t startIndex);

#endif // IMU_READER_H
