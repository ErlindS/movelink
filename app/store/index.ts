import { create } from 'zustand';

export type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';

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

interface BLEStore {
  status: ConnectionStatus;
  deviceId: string | null;
  deviceName: string | null;
  latestReading: IMUReading | null;
  setStatus: (status: ConnectionStatus) => void;
  setDevice: (id: string, name: string) => void;
  setReading: (reading: IMUReading) => void;
  disconnect: () => void;
}

interface TrainingStore {
  isRecording: boolean;
  sessionId: string | null;
  liveBuffer: IMUReading[];
  sessions: TrainingSession[];
  startSession: () => void;
  stopSession: () => void;
  addReading: (reading: IMUReading) => void;
  setSessions: (sessions: TrainingSession[]) => void;
}

export const useBLEStore = create<BLEStore>((set) => ({
  status: 'idle',
  deviceId: null,
  deviceName: null,
  latestReading: null,
  setStatus: (status) => set({ status }),
  setDevice: (deviceId, deviceName) => set({ deviceId, deviceName }),
  setReading: (reading) => set({ latestReading: reading }),
  disconnect: () => set({ status: 'disconnected', deviceId: null, deviceName: null, latestReading: null }),
}));

export const useTrainingStore = create<TrainingStore>((set) => ({
  isRecording: false,
  sessionId: null,
  liveBuffer: [],
  sessions: [],
  startSession: () =>
    set({ isRecording: true, sessionId: Date.now().toString(), liveBuffer: [] }),
  stopSession: () =>
    set({ isRecording: false, sessionId: null }),
  addReading: (reading) =>
    set((state) => ({
      liveBuffer:
        state.liveBuffer.length >= LIVE_BUFFER_SIZE
          ? [...state.liveBuffer.slice(1), reading]
          : [...state.liveBuffer, reading],
    })),
  setSessions: (sessions) => set({ sessions }),
}));
