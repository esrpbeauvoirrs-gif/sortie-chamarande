import { useState, useEffect, useCallback } from 'react';
import { Home, Camera, TreePine, Palette, Heart, Settings, Share2, Lock, Copy, Check } from 'lucide-react';
// Copy et Check utilisés dans le bandeau organisateur
import { EventProvider, useEvent, TAB_UNLOCKS } from './context/EventContext';
import { generateShades } from './utils/colors';
import { WaitingScreen, EndedScreen, LiveStatusBar } from './components/EphemeralUI';
import SettingsPanel from './components/SettingsPanel';
import PinModal from './components/PinModal';
import SyncToast from './components/SyncToast';
import Welcome from './components/Welcome';
import PhotoRally from './components/PhotoRally';
import Exploration from './components/Exploration';
import DrawingCanvas from './components/DrawingCanvas';
import BilanEmotions from './components/BilanEmotions';

type TabId = 'accueil' | 'rallye' | 'exploration' | 'dessin' | 'bilan';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  emoji: string;
}

const tabs: TabConfig[] = [
  { id: 'accueil', label: 'Accueil', icon: <Home size={22} />, emoji: '🏠' },
  { id: 'rallye', label: 'Rallye Photo', icon: <Camera size={22} />, emoji: '📸' },
  { id: 'exploration', label: 'Exploration', icon: <TreePine size={22} />, emoji: '🌿' },
  { id: 'dessin', label: 'Atelier Dessin', icon: <Palette size={22} />, emoji: '🎨' },
  { id: 'bilan', label: 'Bilan', icon: <Heart size={22} />, emoji: '💭' },
];

function AppContent() {
  const { state, config, setShowSettings, isOrganizer, isTabUnlocked, getTabUnlockTime } = useEvent();
  const [activeTab, setActiveTab] = useState<TabId>('accueil');
  const [showPin, setShowPin] = useState(false);
  const [lockedTab, setLockedTab] = useState<TabId | null>(null);

  // ── Apply dynamic colors ──
  useEffect(() => {
    const root = document.documentElement;
    const primaryShades = generateShades(config.primaryColor);
    for (const [shade, color] of Object.entries(primaryShades)) {
      root.style.setProperty(`--color-forest-${shade}`, color);
    }
    root.style.setProperty('--color-cream', primaryShades['50']);
  }, [config.primaryColor, config.accentColor]);

  // ── Share handler ──
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: `${config.eventName} — ${config.associationName}`,
      text: `🌍 Rejoignez-nous pour la sortie "${config.eventName}" !\n📍 ${config.location}\n📅 ${new Date(config.eventDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('✅ Lien copié ! Collez-le dans un message pour le partager.');
    } catch {
      prompt('Copiez ce lien :', url);
    }
  }, [config]);

  // ── Tab click with lock check ──
  const handleTabClick = useCallback((tabId: TabId) => {
    if (isTabUnlocked(tabId)) {
      setActiveTab(tabId);
    } else {
      setLockedTab(tabId);
      setTimeout(() => setLockedTab(null), 2500);
    }
  }, [isTabUnlocked]);

  // ── Settings click with organizer check ──
  const handleSettingsClick = useCallback(() => {
    if (isOrganizer) {
      setShowSettings(true);
    } else {
      setShowPin(true);
    }
  }, [isOrganizer, setShowSettings]);

  // ── Ephemeral state screens ──
  if (state === 'waiting') return (
    <>
      <WaitingScreen onSettingsClick={handleSettingsClick} />
      <SettingsPanel />
      {showPin && <PinModal onSuccess={() => { setShowPin(false); setShowSettings(true); }} onCancel={() => setShowPin(false)} />}
    </>
  );
  if (state === 'ended') return (
    <>
      <EndedScreen onSettingsClick={handleSettingsClick} />
      <SettingsPanel />
      {showPin && <PinModal onSuccess={() => { setShowPin(false); setShowSettings(true); }} onCancel={() => setShowPin(false)} />}
    </>
  );

  // ── LIVE mode ──
  const renderPage = () => {
    switch (activeTab) {
      case 'accueil': return <Welcome onStartRally={() => handleTabClick('rallye')} />;
      case 'rallye': return isTabUnlocked('rallye') ? <PhotoRally /> : <LockedScreen tabId="rallye" />;
      case 'exploration': return isTabUnlocked('exploration') ? <Exploration /> : <LockedScreen tabId="exploration" />;
      case 'dessin': return isTabUnlocked('dessin') ? <DrawingCanvas /> : <LockedScreen tabId="dessin" />;
      case 'bilan': return isTabUnlocked('bilan') ? <BilanEmotions /> : <LockedScreen tabId="bilan" />;
    }
  };

  // ── Copy link for organizer ──
  const [copiedLink, setCopiedLink] = useState(false);
  const { shareableUrl } = useEvent();
  const handleQuickCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      prompt('Copiez ce lien :', shareableUrl);
    }
  }, [shareableUrl]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Bandeau organisateur permanent — rappelle de partager */}
      {isOrganizer && (
        <div className="text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(to right, #E65100, #FF6D00)' }}>
          <span>🔗</span>
          <span>Organisateur — Partagez le lien pour synchroniser les participants</span>
          <button onClick={handleQuickCopy}
            className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
            style={{ backgroundColor: copiedLink ? 'white' : 'rgba(255,255,255,0.2)', color: copiedLink ? '#E65100' : 'white' }}>
            {copiedLink ? <><Check size={11} /> Copié !</> : <><Copy size={11} /> Copier le lien</>}
          </button>
        </div>
      )}

      {/* Toast de notification après modif */}
      <SyncToast />

      {/* Header STTDM */}
      <header className="text-white px-4 py-3 flex-shrink-0 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, var(--color-forest-800), var(--color-forest-600), var(--color-forest-500))` }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 12px, white 12px, white 20px)`,
        }} />
        <div className="flex items-center justify-between max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>🌍</div>
            <div>
              <h1 className="text-sm font-extrabold leading-tight tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {config.eventName}
              </h1>
              <p className="text-[10px] font-medium opacity-80 leading-tight" style={{ fontFamily: 'Cinzel, serif' }}>
                {config.associationName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isOrganizer && (
              <span className="text-[10px] rounded-full px-2 py-0.5 font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                🔑 Orga
              </span>
            )}
            <button onClick={handleShare}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Share2 size={14} className="opacity-90" />
            </button>
            <button onClick={handleSettingsClick}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Settings size={15} className="opacity-90" />
              <span className="text-[11px] font-bold opacity-90 hidden sm:inline">
                {isOrganizer ? 'Paramétrer' : '🔒'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <LiveStatusBar />

      <main className="flex-1 overflow-y-auto pb-20">
        <div key={activeTab} className="animate-fade-in-up">
          {renderPage()}
        </div>
      </main>

      {/* Bottom Navigation with lock indicators */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t flex-shrink-0 z-50"
        style={{ borderColor: 'var(--color-forest-100)', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex justify-around items-center max-w-2xl mx-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const unlocked = isTabUnlocked(tab.id);
            const unlockTime = getTabUnlockTime(tab.id);
            const isLocked = lockedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all duration-300 min-w-[60px] relative ${
                  isActive ? 'tab-active' : ''
                } ${isLocked ? 'animate-pulse' : ''}`}
                style={{
                  color: isActive ? 'var(--color-forest-700)' : unlocked ? '#6B5A5A' : '#BFA8A8',
                  backgroundColor: isActive ? 'var(--color-forest-50)' : 'transparent',
                  opacity: unlocked ? (isActive ? 1 : 0.5) : 0.35,
                }}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''} relative`}>
                  {unlocked ? (isActive ? tab.emoji : tab.icon) : <Lock size={18} />}
                  {!unlocked && unlockTime && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold whitespace-nowrap"
                      style={{ color: '#6B5A5A' }}>
                      {unlockTime.replace(':', 'h')}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <SettingsPanel />
      {showPin && <PinModal onSuccess={() => { setShowPin(false); setShowSettings(true); }} onCancel={() => setShowPin(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🔒 ÉCRAN D'ACTIVITÉ VERROUILLÉE
// ═══════════════════════════════════════════════════════════════

function LockedScreen({ tabId }: { tabId: string }) {
  const { getTabUnlockTime, isOrganizer, unlockOrganizer } = useEvent();
  const unlockTime = getTabUnlockTime(tabId);
  const tabInfo = TAB_UNLOCKS.find(t => t.tabId === tabId);
  const tabConfig = tabs.find(t => t.id === tabId);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#E8CFCB33' }}>
        <Lock size={36} style={{ color: '#6B5A5A' }} />
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: '#6B5A5A' }}>
        Activité pas encore disponible
      </h2>
      <p className="text-sm mb-1" style={{ color: '#6B5A5A', opacity: 0.7 }}>
        {tabConfig?.emoji} {tabInfo?.label} sera accessible à partir de
      </p>
      <p className="text-2xl font-black mb-6" style={{ color: 'var(--color-forest-600)' }}>
        {unlockTime.replace(':', 'h')}
      </p>

      {!isOrganizer && (
        <div className="w-full max-w-xs">
          <p className="text-[10px] mb-2 font-semibold" style={{ color: '#6B5A5A', opacity: 0.5 }}>
            Organisateur ? Saisissez votre code :
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(false); }}
              placeholder="••••"
              className="flex-1 p-3 rounded-xl border-2 text-center text-lg font-bold tracking-[0.5em] outline-none transition-all"
              style={{
                borderColor: pinError ? '#ef4444' : '#E8CFCB',
                color: '#6B5A5A',
              }}
            />
            <button
              onClick={() => {
                if (unlockOrganizer(pinInput)) {
                  // Success — will re-render with unlocked tabs
                } else {
                  setPinError(true);
                  setPinInput('');
                }
              }}
              className="px-4 rounded-xl text-white font-bold text-sm"
              style={{ backgroundColor: 'var(--color-forest-500)' }}
            >
              OK
            </button>
          </div>
          {pinError && (
            <p className="text-xs text-red-500 font-bold mt-1 animate-fade-in-up">❌ Code incorrect</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}
