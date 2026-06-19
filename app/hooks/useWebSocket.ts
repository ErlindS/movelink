import { useEffect, useRef, useCallback } from 'react';
import { useBLEStore, useTrainingStore } from '@/store';

// Backend WebSocket URL — served by AP2 (Luca Schöneberg) via Docker
const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000/ws';
const RECONNECT_DELAY_MS = 3000;

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(true);

  const latestReading = useBLEStore((s) => s.latestReading);
  const { isRecording, sessionId } = useTrainingStore();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };

    ws.current.onclose = () => {
      if (!shouldReconnect.current) return;
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.current.onerror = () => {
      ws.current?.close();
    };
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    ws.current?.close();
  }, []);

  // Forward every new BLE reading to the backend while a session is active
  useEffect(() => {
    if (!isRecording || !latestReading || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ sessionId, reading: latestReading }));
  }, [latestReading, isRecording, sessionId]);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();
    return () => { disconnect(); };
  }, []);

  return { connect, disconnect };
}
