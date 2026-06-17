import { EventConfig, DEFAULT_CONFIG } from '../context/EventContext';

const API = '/api/room';
const POLL_MS = 8_000;

export interface SyncState {
  enabled: boolean;
  roomId: string | null;
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
  isOrganizer: boolean;
}

type Listener = (s: SyncState) => void;

let listeners: Listener[] = [];
let state: SyncState = { enabled: false, roomId: null, syncing: false, lastSync: null, error: null, isOrganizer: false };
let pollTimer: ReturnType<typeof setInterval> | null = null;
let onUpdate: ((c: EventConfig) => void) | null = null;

function notify() { listeners.forEach(fn => fn({ ...state })); }

export function onSyncStateChange(fn: Listener): () => void {
  listeners.push(fn);
  fn({ ...state });
  return () => { listeners = listeners.filter(f => f !== fn); };
}

export function getSyncState(): SyncState { return { ...state }; }

async function apiCreate(data: EventConfig): Promise<string> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`create ${res.status}`);
  const body = await res.json();
  return body.id;
}

async function apiGet(id: string): Promise<EventConfig | null> {
  try {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.eventDate ? { ...DEFAULT_CONFIG, ...data } : null;
  } catch {
    return null;
  }
}

async function apiPut(id: string, data: EventConfig): Promise<boolean> {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function startPoll() {
  stopPoll();
  pollTimer = setInterval(doPoll, POLL_MS);
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function doPoll() {
  if (!state.roomId) return;
  const config = await apiGet(state.roomId);
  if (config && onUpdate) {
    onUpdate(config);
    state = { ...state, lastSync: new Date(), error: null };
    notify();
  }
}

export function initSync(callback: (c: EventConfig) => void): void {
  onUpdate = callback;

  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');

  if (room) {
    state = { enabled: true, roomId: room, syncing: false, lastSync: null, error: null, isOrganizer: false };
    notify();
    doPoll();
    startPoll();
  }
}

export async function createCloudRoom(config: EventConfig): Promise<string> {
  state = { ...state, syncing: true, error: null };
  notify();

  try {
    const roomId = await apiCreate(config);

    const url = new URL(window.location.href.split('?')[0].split('#')[0]);
    url.searchParams.set('room', roomId);
    window.history.replaceState(null, '', url.toString());

    state = {
      enabled: true,
      roomId,
      syncing: false,
      lastSync: new Date(),
      error: null,
      isOrganizer: true,
    };

    notify();
    startPoll();
    return roomId;
  } catch (err) {
    state = { ...state, syncing: false, error: 'Impossible de créer la synchronisation.' };
    notify();
    throw err;
  }
}

export async function pushConfig(config: EventConfig): Promise<boolean> {
  if (!state.enabled || !state.roomId || !state.isOrganizer) return false;

  const ok = await apiPut(state.roomId, config);
  state = {
    ...state,
    lastSync: ok ? new Date() : state.lastSync,
    error: ok ? null : 'Échec de synchronisation',
  };
  notify();
  return ok;
}

export function enableOrganizerMode(): void {
  state = { ...state, isOrganizer: true };
  notify();
}

export function getShareableUrl(): string {
  if (!state.roomId) return window.location.href;
  const url = new URL(window.location.href.split('?')[0].split('#')[0]);
  url.searchParams.set('room', state.roomId);
  return url.toString();
}

export function cleanupSync(): void {
  stopPoll();
  onUpdate = null;
  listeners = [];
}