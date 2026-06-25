// @implements FA2.5
#include "BLEStreamer.h"
#include <ArduinoBLE.h>

static BLEService imuService("12345678-1234-1234-1234-123456789012");
static BLECharacteristic imuCharacteristic("12345678-1234-1234-1234-123456789013", BLERead | BLENotify, 24);
static BLECharacteristic inferenceCharacteristic("12345678-1234-1234-1234-123456789014", BLERead | BLENotify, 128);

bool initBLE() {
    if (!BLE.begin()) {
        Serial.println("Starting BLE failed!");
        return false;
    }
    
    BLE.setLocalName("MoveLink Sensor");
    BLE.setAdvertisedService(imuService);
    
    imuService.addCharacteristic(imuCharacteristic);
    imuService.addCharacteristic(inferenceCharacteristic);
    BLE.addService(imuService);
    
    // Initial data: 6 floats (24 bytes) all set to 0.0f
    float initialData[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    imuCharacteristic.writeValue((uint8_t*)initialData, 24);
    inferenceCharacteristic.writeValue("{}");
    
    BLE.advertise();
    Serial.println("BLE advertising started.");
    return true;
}

void streamIMUData(float ax, float ay, float az, float gx, float gy, float gz) {
    float packet[6] = {ax, ay, az, gx, gy, gz};
    
    // Update the characteristic value and notify connected client
    imuCharacteristic.writeValue((uint8_t*)packet, 24);
    
    // Periodically poll BLE state
    BLE.poll();
}

void streamInferenceResult(const String& label, float confidence, float anomaly, const String& tipp) {
    // Erstelle ein kompaktes JSON
    String json = "{\"label\":\"" + label + "\",\"conf\":" + String(confidence, 2) + ",\"tipp\":\"" + tipp + "\"}";
    inferenceCharacteristic.writeValue(json.c_str());
    BLE.poll();
}
