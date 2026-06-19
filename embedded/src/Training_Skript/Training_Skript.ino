// XIAO BLE Sense LSM6DS3 - 6 Achsen (Accel + Gyro) Raw Data 

#include "LSM6DS3.h"
#include "Wire.h"

// Instanz der LSM6DS3 Klasse erstellen
LSM6DS3 myIMU(I2C_MODE, 0x6A); 

#define CONVERT_G_TO_MS2 9.80665f
#define FREQUENCY_HZ 50
#define INTERVAL_MS (1000 / (FREQUENCY_HZ + 1))

static unsigned long last_interval_ms = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial);

  if (myIMU.begin() != 0) {
    Serial.println("Device error");
  } else {
    Serial.println("Device OK!");
  }
}

void loop() {
  if (millis() > last_interval_ms + INTERVAL_MS) {
    last_interval_ms = millis();

    // 1. Beschleunigung (m/s^2)
    Serial.print(myIMU.readFloatAccelX() * CONVERT_G_TO_MS2, 4);
    Serial.print('\t');
    Serial.print(myIMU.readFloatAccelY() * CONVERT_G_TO_MS2, 4);
    Serial.print('\t');
    Serial.print(myIMU.readFloatAccelZ() * CONVERT_G_TO_MS2, 4);
    Serial.print('\t');

    // 2. Gyroskop (Grad pro Sekunde - dps)
    Serial.print(myIMU.readFloatGyroX(), 4);
    Serial.print('\t');
    Serial.print(myIMU.readFloatGyroY(), 4);
    Serial.print('\t');
    Serial.println(myIMU.readFloatGyroZ(), 4); // println am Ende für den Zeilenumbruch
  }
}