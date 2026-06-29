/**
 * @implements FA1.5, FA1.6
 */
import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type TrainingStatus = 'idle' | 'preparing' | 'recording';
export type ExerciseState = 'start' | 'moving' | 'peak' | 'returning';
export type ExerciseType = 'squat' | 'curl';

export interface IMUReading {
  timestamp: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
}

export interface TrainingSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  readingCount: number;
}

// Max data points kept in-memory for the live chart (rolling buffer)
const LIVE_BUFFER_SIZE = 100;

export const EXERCISE_TARGETS: Record<ExerciseType, number> = {
  squat: 70, // 70 Grad Kniebeuge-Tiefe
  curl: 90,  // 90 Grad Ellenbogenbeugung
};

// Filter states (keep outside Zustand state to prevent React render storms on raw intermediate numbers)
let lastTimestamp = 0;
let filteredAngle = 0;

interface BLEStore {
  status: ConnectionStatus;
  deviceId: string | null;
  deviceName: string | null;
  latestReading: IMUReading | null;
  isDemoMode: boolean;
  inferenceLabel: string | null;
  inferenceConfidence: number | null;
  inferenceAnomaly: number | null;
  inferenceTipp: string | null;
  setStatus: (status: ConnectionStatus) => void;
  setDevice: (id: string, name: string) => void;
  setReading: (reading: IMUReading) => void;
  setDemoMode: (isDemoMode: boolean) => void;
  setInference: (label: string, confidence: number, anomaly: number, tipp: string) => void;
  disconnect: () => void;
}

interface TrainingStore {
  isRecording: boolean;
  sessionId: string | null;
  liveBuffer: IMUReading[];
  sessions: TrainingSession[];
  
  // New interactive training states
  status: TrainingStatus;
  exercise: ExerciseType;
  exerciseState: ExerciseState;
  repCount: number;
  currentAngle: number;
  countdown: number;
  
  // Existing and new actions
  startSession: () => void;
  stopSession: () => void;
  startTraining: (exercise: ExerciseType) => void;
  stopTraining: () => void;
  setCountdown: (countdown: number) => void;
  addReading: (reading: IMUReading) => void;
  setSessions: (sessions: TrainingSession[]) => void;
  resetTraining: () => void;
}

export const useBLEStore = create<BLEStore>((set) => ({
  status: 'idle',
  deviceId: null,
  deviceName: null,
  latestReading: null,
  isDemoMode: false,
  inferenceLabel: null,
  inferenceConfidence: null,
  inferenceAnomaly: null,
  inferenceTipp: null,
  setStatus: (status) => set({ status }),
  setDevice: (deviceId, deviceName) => set({ deviceId, deviceName }),
  setReading: (reading) => set({ latestReading: reading }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  setInference: (inferenceLabel, inferenceConfidence, inferenceAnomaly, inferenceTipp) => set({ inferenceLabel, inferenceConfidence, inferenceAnomaly, inferenceTipp }),
  disconnect: () => set({ status: 'disconnected', deviceId: null, deviceName: null, latestReading: null, inferenceLabel: null, inferenceConfidence: null, inferenceAnomaly: null, inferenceTipp: null }),
}));

export const useTrainingStore = create<TrainingStore>((set) => ({
  isRecording: false,
  sessionId: null,
  liveBuffer: [],
  sessions: [],
  
  // Default interactive states
  status: 'idle',
  exercise: 'squat',
  exerciseState: 'start',
  repCount: 0,
  currentAngle: 0,
  countdown: 3,

  startSession: () => {
    // Reset filters
    lastTimestamp = 0;
    filteredAngle = 0;
    
    set({ 
      isRecording: true, 
      sessionId: Date.now().toString(), 
      liveBuffer: [],
      status: 'recording',
      repCount: 0,
      currentAngle: 0,
      exerciseState: 'start',
    });
  },

  stopSession: () => {
    set((state) => {
      const newSession: TrainingSession = {
        id: state.sessionId || Date.now().toString(),
        startedAt: new Date(Date.now() - state.liveBuffer.length * 20).toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: Math.round(state.liveBuffer.length * 0.02), // 50Hz assumed
        readingCount: state.liveBuffer.length,
      };

      return {
        isRecording: false,
        sessionId: null,
        status: 'idle',
        sessions: [newSession, ...state.sessions],
      };
    });
  },

  startTraining: (exercise: ExerciseType) => {
    set({
      status: 'preparing',
      exercise,
      repCount: 0,
      currentAngle: 0,
      exerciseState: 'start',
      countdown: 3,
    });
  },

  stopTraining: () => {
    const { stopSession } = useTrainingStore.getState();
    stopSession();
  },

  setCountdown: (countdown: number) => set({ countdown }),

  resetTraining: () => {
    set({
      status: 'idle',
      repCount: 0,
      currentAngle: 0,
      exerciseState: 'start',
      isRecording: false,
      sessionId: null,
    });
  },

  addReading: (reading) => {
    set((state) => {
      // 1. Process complementary filter
      const ax = reading.accelX;
      const ay = reading.accelY;
      const az = reading.accelZ;

      // Winkel aus Beschleunigungsmesser berechnen (in Grad)
      const accelAngle = Math.atan2(ay, Math.sqrt(ax * ax + az * az)) * (180 / Math.PI);
      
      // Winkelgeschwindigkeit (rad/s in deg/s umrechnen)
      const gyroRate = reading.gyroX * (180 / Math.PI);

      const now = reading.timestamp;
      if (lastTimestamp === 0) {
        filteredAngle = accelAngle;
      } else {
        const dt = (now - lastTimestamp) / 1000; // Zeitdifferenz in Sekunden
        const alpha = 0.96;
        filteredAngle = alpha * (filteredAngle + gyroRate * dt) + (1 - alpha) * accelAngle;
      }
      lastTimestamp = now;

      // Winkel normalisieren (absoluten Betrag nehmen)
      const angle = Math.min(180, Math.max(0, Math.abs(filteredAngle)));

      // 2. FSM (Finite State Machine) für Wiederholungsvergleich
      const target = EXERCISE_TARGETS[state.exercise];
      let nextExState = state.exerciseState;
      let nextRepCount = state.repCount;

      if (state.exerciseState === 'start') {
        if (angle > 20) {
          nextExState = 'moving';
        }
      } else if (state.exerciseState === 'moving') {
        if (angle >= target) {
          nextExState = 'peak';
          // Erfolgs-Vibration bei Erreichen des Zielwinkels
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        }
      } else if (state.exerciseState === 'peak') {
        if (angle < target - 8) {
          nextExState = 'returning';
        }
      } else if (state.exerciseState === 'returning') {
        if (angle < 15) {
          nextExState = 'start';
          nextRepCount += 1;
          // Kurze Bestätigungs-Vibration für vollendete Wiederholung
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
        }
      }

      return {
        currentAngle: parseFloat(angle.toFixed(1)),
        exerciseState: nextExState,
        repCount: nextRepCount,
        liveBuffer:
          state.liveBuffer.length >= LIVE_BUFFER_SIZE
            ? [...state.liveBuffer.slice(1), reading]
            : [...state.liveBuffer, reading],
      };
    });
  },

  setSessions: (sessions) => set({ sessions }),
}));
