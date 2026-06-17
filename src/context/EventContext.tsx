import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { safeGet, safeSet } from '../utils/storage';
import { decodeConfigFromUrl, urlHasConfig, updateBrowserUrl, encodeConfigToUrl } from '../utils/urlConfig';
import {
  initSync, pushConfig, createCloudRoom as cloudCreateRoom,
  getShareableUrl as cloudGetShareableUrl,
  getSyncState, onSyncStateChange,
  enableOrganizerMode, cleanupSync, SyncState
} from '../utils/cloudSync';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES
// ═══════════════════════════════════════════════════════════════

export interface ScheduleItem { time: string; label: string; emoji: string; desc: string; }
export interface TeamMember { emoji: string; role: string; }

export interface EventConfig {
  eventName: string; associationName: string; location: string; contactInfo: string;
  welcomeMessage: string; endMessage: string;
  eventDate: string; startTime: string; endTime: string;
  schedule: ScheduleItem[]; team: TeamMember[];
  primaryColor: string; accentColor: string;
  organizerPin: string; demoMode: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 📦 DÉFAUTS
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { time: '09:00', label: 'Accueil', emoji: '👋', desc: 'Arrivée au domaine' },
  { time: '09:30', label: 'Rallye Photo', emoji: '📸', desc: 'Explorez en photos !' },
  { time: '11:00', label: 'Balade Sensorielle', emoji: '🌿', desc: 'Utilisez vos 5 sens' },
  { time: '12:00', label: 'Pique-nique', emoji: '🧺', desc: 'Repas tous ensemble' },
  { time: '13:30', label: 'Atelier Dessin', emoji: '🎨', desc: 'Dessinez le domaine' },
  { time: '15:00', label: 'Bilan & Photo', emoji: '📷', desc: 'Photo de groupe' },
  { time: '15:30', label: 'Départ', emoji: '🚌', desc: 'Fin de la journée' },
];
export const DEFAULT_TEAM: TeamMember[] = [
  { emoji: '📖', role: 'Professeurs de linguistique' },
  { emoji: '🏥', role: 'Professeurs de santé' },
  { emoji: '🔬', role: 'Professeurs de sciences' },
];
export const DEFAULT_CONFIG: EventConfig = {
  eventName: 'Sortie Pédagogique', associationName: 'Sous Tous Les Toits Du Monde',
  location: 'Domaine de Chamarande, Essonne (91)', contactInfo: '',
  welcomeMessage: 'Apprentissage du français et renforcement des liens familiaux à travers des activités ludiques en plein air.',
  endMessage: 'Quelle belle journée ! Les souvenirs resteront dans nos cœurs.',
  eventDate: '2026-06-17', startTime: '09:00', endTime: '15:30',
  schedule: DEFAULT_SCHEDULE, team: DEFAULT_TEAM,
  primaryColor: '#37C2C7', accentColor: '#EFC0A8',
  organizerPin: '1706', demoMode: false,
};

// ═══════════════════════════════════════════════════════════════
// 🗺️ ONGLETS DÉBLOQUÉS PAR HORAIRE
// ═══════════════════════════════════════════════════════════════

export interface TabUnlock { tabId: string; unlockTime: string; label: string; }
export const TAB_UNLOCKS: TabUnlock[] = [
  { tabId: 'accueil', unlockTime: '09:00', label: 'Accueil' },
  { tabId: 'rallye', unlockTime: '09:30', label: 'Rallye Photo' },
  { tabId: 'exploration', unlockTime: '11:00', label: 'Balade Sensorielle' },
  { tabId: 'dessin', unlockTime: '13:30', label: 'Atelier Dessin' },
  { tabId: 'bilan', unlockTime: '15:00', label: 'Bilan & Photo' },
];

// ═══════════════════════════════════════════════════════════════
// 💾 PERSISTENCE
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'chamarande_config';
const PIN_KEY = 'chamarande_organizer';

function loadConfig(): EventConfig {
  const urlConfig = decodeConfigFromUrl();
  if (urlConfig) return urlConfig;
  try {
    const raw = safeGet(STORAGE_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (parsed.eventDate) return { ...DEFAULT_CONFIG, ...parsed }; }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(c: EventConfig) {
  safeSet(STORAGE_KEY, JSON.stringify(c));
  updateBrowserUrl(c);
}

// ═══════════════════════════════════════════════════════════════
// 🕐 UTILITAIRES
// ═══════════════════════════════════════════════════════════════

export function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const sec = Math.floor(ms / 1000);
  return [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map(v => v.toString().padStart(2, '0')).join(':');
}
export function formatTimeShort(ms: number): string {
  if (ms <= 0) return '0min';
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`;
}
function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 CONTEXT
// ═══════════════════════════════════════════════════════════════

export type EventState = 'waiting' | 'live' | 'ended';

interface EventContextType {
  state: EventState; timeRemaining: number; progressPercent: number; currentActivityIndex: number;
  config: EventConfig; updateConfig: (updates: Partial<EventConfig>) => void;
  showSettings: boolean; setShowSettings: (v: boolean) => void;
  isOrganizer: boolean; unlockOrganizer: (pin: string) => boolean;
  isTabUnlocked: (tabId: string) => boolean; getTabUnlockTime: (tabId: string) => string;
  isFromUrl: boolean; shareableUrl: string;
  sync: SyncState; createCloudRoom: () => Promise<string>;
}

const EventContext = createContext<EventContextType | null>(null);
export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvent must be used within EventProvider');
  return ctx;
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<EventConfig>(loadConfig);
  const [now, setNow] = useState(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [isOrganizer, setIsOrganizer] = useState(() => {
    try { return sessionStorage.getItem(PIN_KEY) === 'true'; } catch { return false; }
  });

  const isFromUrl = urlHasConfig();
  const shareableUrl = syncState.roomId ? cloudGetShareableUrl() : encodeConfigToUrl(config);

  // ── Cloud sync init ──
  useEffect(() => {
    const unsub = onSyncStateChange(setSyncState);
    initSync((cloudConfig: EventConfig) => setConfig(cloudConfig));
    return () => { cleanupSync(); unsub(); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const createCloudRoomFn = useCallback(async (): Promise<string> => {
    const code = await cloudCreateRoom(config);
    enableOrganizerMode();
    return code;
  }, [config]);

  const updateConfig = useCallback((updates: Partial<EventConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      saveConfig(next);
      try { import('../components/SyncToast').then(m => m.notifyConfigChanged()); } catch {}
      pushConfig(next).catch(() => {});
      return next;
    });
  }, []);

  const unlockOrganizer = useCallback((pin: string): boolean => {
    if (pin === config.organizerPin) {
      setIsOrganizer(true);
      try { sessionStorage.setItem(PIN_KEY, 'true'); } catch {}
      return true;
    }
    return false;
  }, [config.organizerPin]);

  const isTabUnlocked = useCallback((tabId: string): boolean => {
    if (isOrganizer || config.demoMode) return true;
    const unlock = TAB_UNLOCKS.find(t => t.tabId === tabId);
    if (!unlock) return true;
    const nowDate = new Date(now);
    return nowDate.getHours() * 60 + nowDate.getMinutes() >= timeToMinutes(unlock.unlockTime);
  }, [isOrganizer, config.demoMode, now]);

  const getTabUnlockTime = useCallback((tabId: string): string => {
    const unlock = TAB_UNLOCKS.find(t => t.tabId === tabId);
    return unlock ? unlock.unlockTime : '';
  }, []);

  // ── Calculate event state ──
  const start = parseDateTime(config.eventDate, config.startTime);
  const end = parseDateTime(config.eventDate, config.endTime);
  const nowDate = new Date(now);

  let state: EventState;
  if (config.demoMode) state = 'live';
  else if (nowDate < start) state = 'waiting';
  else if (nowDate >= end) state = 'ended';
  else state = 'live';

  const totalDuration = end.getTime() - start.getTime();
  let progressPercent = 0;
  if (config.demoMode) {
    const nowMin = nowDate.getHours() * 60 + nowDate.getMinutes();
    progressPercent = Math.min(100, Math.max(5, ((nowMin - timeToMinutes(config.startTime)) / (timeToMinutes(config.endTime) - timeToMinutes(config.startTime)) * 100)));
  } else if (state === 'live') progressPercent = Math.min(100, Math.max(0, ((now - start.getTime()) / totalDuration) * 100));
  else if (state === 'ended') progressPercent = 100;

  const timeRemaining = config.demoMode
    ? Math.max(0, totalDuration * (1 - progressPercent / 100))
    : state === 'live' ? Math.max(0, end.getTime() - now)
    : state === 'waiting' ? Math.max(0, start.getTime() - now) : 0;

  let currentActivityIndex = 0;
  for (let i = config.schedule.length - 1; i >= 0; i--) {
    if (nowDate >= parseDateTime(config.eventDate, config.schedule[i].time)) { currentActivityIndex = i; break; }
  }

  return (
    <EventContext.Provider value={{
      state, timeRemaining, progressPercent, currentActivityIndex,
      config, updateConfig, showSettings, setShowSettings,
      isOrganizer, unlockOrganizer, isTabUnlocked, getTabUnlockTime,
      isFromUrl, shareableUrl, sync: syncState, createCloudRoom: createCloudRoomFn,
    }}>
      {children}
    </EventContext.Provider>
  );
}
