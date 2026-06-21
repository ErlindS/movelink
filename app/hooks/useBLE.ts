/**
 * @implements FA3, FA5, NF2
 */
import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  BleManager,
  Device,
  BleError,
  Characteristic,
  State,
} from 'react-native-ble-plx';
import { BLE_SERVICE_UUID, BLE_IMU_CHARACTERISTIC_UUID, BLE_RECONNECT_DELAY_MS, BLE_MAX_RECONNECT_ATTEMPTS } from '@/constants/BLE';
import { useBLEStore, useTrainingStore, IMUReading } from '@/store';

function parseIMUPacket(base64: string): IMUReading | null {
  try {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
    const floats = new Float32Array(buffer);
    if (floats.length < 6) return null;
    return {
      timestamp: Date.now(),
      accelX: floats[0],
      accelY: floats[1],
      accelZ: floats[2],
      gyroX: floats[3],
      gyroY: floats[4],
      gyroZ: floats[5],
    };
  } catch {
    return null;
  }
}

export function useBLE() {
  const manager = useRef<BleManager | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStatus, setDevice, setReading, disconnect, status } = useBLEStore();
  const { addReading, isRecording } = useTrainingStore();

  useEffect(() => {
    // BLE is not available on web
    if (Platform.OS === 'web') return;

    let subscription: { remove: () => void } | null = null;
    try {
      manager.current = new BleManager();
      subscription = manager.current.onStateChange((state) => {
        if (state === State.PoweredOn) subscription?.remove();
      }, true);
    } catch (e) {
      console.warn("BleManager could not be initialized. This is expected inside Expo Go. Standing by for Dev Client build.");
      manager.current = null;
    }

    return () => {
      if (subscription) {
        try {
          subscription.remove();
        } catch (e) {}
      }
      if (manager.current) {
        try {
          manager.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  const handleDisconnect = useCallback((deviceId: string) => {
    setStatus('disconnected');
    if (reconnectAttempts.current >= BLE_MAX_RECONNECT_ATTEMPTS) {
      setStatus('error');
      return;
    }
    reconnectTimer.current = setTimeout(() => {
      reconnectAttempts.current += 1;
      connectToDevice(deviceId);
    }, BLE_RECONNECT_DELAY_MS);
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    if (!manager.current) return;
    try {
      setStatus('connecting');
      const device = await manager.current.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      setDevice(device.id, device.name ?? 'MoveLink Sensor');
      setStatus('connected');
      reconnectAttempts.current = 0;

      device.onDisconnected(() => handleDisconnect(device.id));

      device.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        BLE_IMU_CHARACTERISTIC_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (error || !characteristic?.value) return;
          const reading = parseIMUPacket(characteristic.value);
          if (!reading) return;
          setReading(reading);
          if (useTrainingStore.getState().isRecording) {
            useTrainingStore.getState().addReading(reading);
          }
        }
      );
    } catch {
      setStatus('error');
    }
  }, [handleDisconnect]);

  const startScan = useCallback(() => {
    if (!manager.current || Platform.OS === 'web') {
      console.warn("Scanning requires a development client build with native BLE support.");
      return;
    }

    setStatus('scanning');

    manager.current.startDeviceScan(
      [BLE_SERVICE_UUID],
      null,
      (error: BleError | null, device: Device | null) => {
        if (error) { setStatus('error'); return; }
        if (!device) return;

        manager.current?.stopDeviceScan();
        connectToDevice(device.id);
      }
    );
  }, [connectToDevice]);

  const stopScan = useCallback(() => {
    manager.current?.stopDeviceScan();
    if (status === 'scanning') setStatus('idle');
  }, [status]);

  const disconnectDevice = useCallback(async () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    const { deviceId } = useBLEStore.getState();
    if (deviceId && Platform.OS !== 'web' && manager.current) {
      try {
        await manager.current.cancelDeviceConnection(deviceId);
      } catch (e) {}
    }
    disconnect();
  }, [disconnect]);

  return { startScan, stopScan, disconnectDevice };
}
