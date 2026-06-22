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
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const simStartTime = useRef<number>(0);

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
      if (simInterval.current) clearInterval(simInterval.current);
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
    const { isDemoMode } = useBLEStore.getState();

    // Trigger simulation if:
    // - Demo mode is explicitly turned on
    // - Running in web browser
    // - running in Expo Go (where manager is null)
    if (isDemoMode || Platform.OS === 'web' || !manager.current) {
      setStatus('connecting');
      setTimeout(() => {
        setDevice('mock-device-id', isDemoMode ? 'Simulierter Sensor (Demo)' : (!manager.current ? 'Simulierter Sensor (Expo Go)' : 'Simulierter Web-Sensor'));
        setStatus('connected');
        reconnectAttempts.current = 0;

        if (simInterval.current) clearInterval(simInterval.current);
        simStartTime.current = Date.now();

        simInterval.current = setInterval(() => {
          const { isRecording: activeRecording } = useTrainingStore.getState();
          const t = (Date.now() - simStartTime.current) / 1000;
          
          // Repetition duration = 4s
          const T = 4;
          const phase = (2 * Math.PI * t) / T;
          
          // Smooth sine curve representing angles (5° up to 85° back and forth)
          const targetAngle = 5 + 80 * (0.5 - 0.5 * Math.cos(phase));
          const rad = targetAngle * (Math.PI / 180);

          // Gyroscope rate of change in rad/s: d/dt(rad)
          const omega = (2 * Math.PI) / T;
          const gyroRateRad = (80 * (Math.PI / 180) * 0.5 * omega * Math.sin(phase));

          const reading: IMUReading = {
            timestamp: Date.now(),
            accelX: 0,
            accelY: Math.sin(rad),
            accelZ: Math.cos(rad),
            gyroX: gyroRateRad,
            gyroY: 0,
            gyroZ: 0,
          };

          setReading(reading);
          if (activeRecording) {
            useTrainingStore.getState().addReading(reading);
          }
        }, 40); // 25Hz feed
      }, 600);
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
    if (simInterval.current) {
      clearInterval(simInterval.current);
      simInterval.current = null;
    }
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
