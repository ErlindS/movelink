/**
 * @implements FA1.3, FA1.5, NF2
 */
import { useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  BleManager,
  Device,
  BleError,
  Characteristic,
  State,
} from 'react-native-ble-plx';
import { BLE_SERVICE_UUID, BLE_IMU_CHARACTERISTIC_UUID, BLE_INFERENCE_CHARACTERISTIC_UUID, BLE_RECONNECT_DELAY_MS, BLE_MAX_RECONNECT_ATTEMPTS } from '@/constants/BLE';
import { useBLEStore, useTrainingStore, IMUReading } from '@/store';

function decodeBase64ToString(base64: string): string {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const str = base64.replace(/=+$/, '');
    const len = str.length;
    let binary = '';
    
    for (let i = 0; i < len; i += 4) {
      const c1 = chars.indexOf(str[i]);
      const c2 = chars.indexOf(str[i + 1]);
      const c3 = i + 2 < len ? chars.indexOf(str[i + 2]) : 0;
      const c4 = i + 3 < len ? chars.indexOf(str[i + 3]) : 0;
      
      const b1 = (c1 << 2) | (c2 >> 4);
      const b2 = ((c2 & 15) << 4) | (c3 >> 2);
      const b3 = ((c3 & 3) << 6) | c4;
      
      binary += String.fromCharCode(b1);
      if (i + 2 < len) binary += String.fromCharCode(b2);
      if (i + 3 < len) binary += String.fromCharCode(b3);
    }
    return binary;
  } catch {
    return '';
  }
}

function parseIMUPacket(base64: string): IMUReading | null {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const str = base64.replace(/=+$/, '');
    const len = str.length;
    const buffer = new ArrayBuffer(((len * 3) / 4) | 0);
    const view = new Uint8Array(buffer);
    
    let p = 0;
    for (let i = 0; i < len; i += 4) {
      const c1 = chars.indexOf(str[i]);
      const c2 = chars.indexOf(str[i + 1]);
      const c3 = i + 2 < len ? chars.indexOf(str[i + 2]) : 0;
      const c4 = i + 3 < len ? chars.indexOf(str[i + 3]) : 0;
      
      view[p++] = (c1 << 2) | (c2 >> 4);
      if (i + 2 < len) {
        view[p++] = ((c2 & 15) << 4) | (c3 >> 2);
      }
      if (i + 3 < len) {
        view[p++] = ((c3 & 3) << 6) | c4;
      }
    }

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

      device.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        BLE_INFERENCE_CHARACTERISTIC_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (error || !characteristic?.value) return;
          const jsonStr = decodeBase64ToString(characteristic.value);
          if (!jsonStr) return;
          try {
            const data = JSON.parse(jsonStr);
            if (data && typeof data.label === 'string') {
              useBLEStore.getState().setInference(data.label, data.conf ?? 0, data.tipp ?? '');
            }
          } catch (e) {
            console.error("Error parsing BLE inference JSON:", e);
          }
        }
      );
    } catch {
      setStatus('error');
    }
  }, [handleDisconnect]);

  const startScan = useCallback(async () => {
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

          // Simulate Chip Inference in demo mode
          const repTime = t % 4;
          if (repTime > 1.8 && repTime < 2.2) {
            useBLEStore.getState().setInference("curl_sauber", 0.98, "Super Ausfuehrung!");
          } else if (repTime > 3.8 || repTime < 0.2) {
            useBLEStore.getState().setInference("idle", 0.99, "Bereit");
          }
        }, 40); // 25Hz feed
      }, 600);
      return;
    }

    // Request permissions on Android before scanning
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.Version;
        if (typeof apiLevel === 'number' && apiLevel >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
          
          const scanGranted = granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED;
          const connectGranted = granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;
          
          if (!scanGranted || !connectGranted) {
            console.warn("Bluetooth permissions denied by user.");
            setStatus('error');
            return;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn("Location permission denied by user (required for Bluetooth scanning on older Android versions).");
            setStatus('error');
            return;
          }
        }
      } catch (err) {
        console.error("Error requesting Bluetooth permissions:", err);
        setStatus('error');
        return;
      }
    }

    setStatus('scanning');

    manager.current.startDeviceScan(
      [BLE_SERVICE_UUID],
      null,
      (error: BleError | null, device: Device | null) => {
        if (error) { 
          console.error("BLE Device scan error:", error);
          setStatus('error'); 
          return; 
        }
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
