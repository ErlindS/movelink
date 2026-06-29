// XIAO BLE Sense LSM6DS3 Accelerometer Raw Data 

#include "LSM6DS3.h"
#include "Wire.h"

//Create a instance of class LSM6DS3
LSM6DS3 myIMU(I2C_MODE, 0x6A);  //I2C device address 0x6A

#define CONVERT_G_TO_MS2 9.80665f
#define FREQUENCY_HZ 50
#define INTERVAL_MS (1000 / (FREQUENCY_HZ + 1))

static unsigned long last_interval_ms = 0;


void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;

  myIMU.begin();
}


void loop() {
  if (millis() > last_interval_ms + INTERVAL_MS) {
    last_interval_ms = millis();
    Serial.print(myIMU.readFloatAccelX() * CONVERT_G_TO_MS2, 4);
    Serial.print(',');
    Serial.print(myIMU.readFloatAccelY() * CONVERT_G_TO_MS2, 4);
    Serial.print(',');
    Serial.print(myIMU.readFloatAccelZ() * CONVERT_G_TO_MS2, 4);
    Serial.print(',');
    Serial.print(myIMU.readFloatGyroX(), 4);
    Serial.print(',');
    Serial.print(myIMU.readFloatGyroY(), 4);
    Serial.print(',');
    Serial.println(myIMU.readFloatGyroZ(), 4);
  }
}

