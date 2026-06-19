// GATT UUIDs — to be confirmed with AP3 (Erlind Sejdiu)
// These are placeholders matching the XIAO nRF52840 firmware implementation.
export const BLE_SERVICE_UUID = '12345678-1234-1234-1234-123456789012';
export const BLE_IMU_CHARACTERISTIC_UUID = '12345678-1234-1234-1234-123456789013';

// Packet layout sent by firmware (6 floats × 4 bytes = 24 bytes)
// [accelX, accelY, accelZ, gyroX, gyroY, gyroZ]
export const BLE_PACKET_SIZE = 24;

export const BLE_SCAN_TIMEOUT_MS = 10000;
export const BLE_RECONNECT_DELAY_MS = 3000;
export const BLE_MAX_RECONNECT_ATTEMPTS = 5;
