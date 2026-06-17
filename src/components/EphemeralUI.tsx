import { useEvent, formatTime, formatTimeShort } from '../context/EventContext';
import { Settings, Clock, Timer, RotateCcw, AlertTriangle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// 🌙 ÉCRAN D'ATTENTE
// ═══════════════════════════════════════════════════════════════
export function WaitingScreen({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { timeRemaining, config } = useEvent();

  const isToday = config.eventDate === new Date().toISOString().split('T')[0];
  const isBeforeStart = timeRemaining > 0;

  const eventDate = new Date(config.eventDate + 'T00:00:00');
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] via-[#122a1c] to-[#1a3a25]" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 4}s`, animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.2 + Math.random() * 0.6,
            }} />
        ))}
      </div>
      <div className="fixed top-12 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-[0_0_40px_rgba(253,224,71,0.3)] opacity-80" />

      {/* Settings button */}
      <button onClick={onSettingsClick}
        className="fixed top-4 left-4 z-30 bg-white/15 backdrop-blur-md border border-white/25 text-white px-3 py-2 rounded-xl hover:bg-white/25 transition-colors flex items-center gap-1.5">
        <Settings size={16} />
        <span className="text-xs font-bold">Organisateur</span>
      </button>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-white">
        <div className="max-w-sm w-full text-center">
          <div className="text-7xl mb-2 animate-float opacity-90">🌲</div>
          <h1 className="text-3xl font-black mb-1">{config.eventName}</h1>
          <h2 className="text-lg font-bold opacity-70 mb-1">{config.location}</h2>
          <p className="text-sm opacity-50 mb-8" style={{ fontFamily: 'Cinzel, serif' }}>{config.associationName}</p>

          {isToday && isBeforeStart ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
              <Timer className="mx-auto mb-3 text-amber-300" size={28} />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">La sortie commence dans</p>
              <p className="text-5xl font-black font-mono tracking-wider text-amber-300 drop-shadow-lg">
                {formatTime(timeRemaining)}
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
              <Clock className="mx-auto mb-3 text-amber-300" size={28} />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">Date de la sortie</p>
              <p className="text-2xl font-black text-amber-300 capitalize">{formattedDate}</p>
              <p className="text-sm opacity-60 mt-1">de {config.startTime.replace(':', 'h')} à {config.endTime.replace(':', 'h')}</p>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-6">
            <p className="text-[10px] opacity-40 leading-relaxed">
              ⏳ Cette application est <strong>éphémère</strong>. Elle n'est active que le {formattedDate}.
            </p>
          </div>

          <button onClick={onSettingsClick}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-semibold py-2.5 px-6 rounded-xl transition-all text-xs flex items-center justify-center gap-2 mx-auto">
            <Settings size={14} /> Accès organisateur
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🌅 ÉCRAN DE FIN
// ═══════════════════════════════════════════════════════════════
export function EndedScreen({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { config, updateConfig } = useEvent();
  const schedule = config.schedule;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff6b35] via-[#f7931e] to-[#ffd700]" />

      <button onClick={onSettingsClick}
        className="fixed top-4 left-4 z-30 bg-white/15 backdrop-blur-md border border-white/25 text-white px-3 py-2 rounded-xl hover:bg-white/25 transition-colors flex items-center gap-1.5">
        <Settings size={16} />
        <span className="text-xs font-bold">Organisateur</span>
      </button>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-32 h-10 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-[30%] right-[15%] w-40 h-12 bg-white/10 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full text-center text-white">
          <div className="text-7xl mb-4 animate-float">🌅</div>
          <h1 className="text-3xl font-black mb-2">Merci !</h1>
          <p className="text-lg font-bold opacity-90 mb-1">Cette aventure est terminée</p>
          <p className="text-sm opacity-70 mb-8 leading-relaxed">{config.endMessage}</p>

          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 mb-6 border border-white/20 text-left">
            <h3 className="text-sm font-bold mb-3 text-center opacity-80">Ce que nous avons vécu</h3>
            {schedule.slice(0, -1).map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/10 last:border-0">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-xs font-bold">{item.time.replace(':', 'h')}</span>
                <span className="text-xs opacity-80">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/10 mb-6">
            <AlertTriangle size={20} className="mx-auto mb-2 opacity-60" />
            <p className="text-xs opacity-60 leading-relaxed">
              Cette application éphémère a été conçue pour une seule journée.
            </p>
          </div>

          <button onClick={() => updateConfig({ demoMode: true })}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 font-semibold py-2 px-6 rounded-xl transition-all text-xs flex items-center justify-center gap-2 mb-2">
            <RotateCcw size={14} /> Rouvrir en mode aperçu
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 📊 BARRE DE PROGRESSION LIVE
// ═══════════════════════════════════════════════════════════════
export function LiveStatusBar() {
  const { state, timeRemaining, progressPercent, currentActivityIndex, config, setShowSettings, isOrganizer } = useEvent();

  if (state !== 'live') return null;

  const schedule = config.schedule;
  const current = schedule[currentActivityIndex];

  return (
    <>
      <div className="h-1 bg-gray-200 relative">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%`, background: `linear-gradient(to right, var(--color-forest-400), var(--color-forest-600))` }} />
      </div>

      <div className="border-b px-4 py-2" style={{ backgroundColor: 'var(--color-forest-50)', borderColor: 'var(--color-forest-100)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm">{current?.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--color-forest-700)' }}>{current?.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-forest-500)' }}>{current?.time.replace(':', 'h')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-semibold" style={{ color: 'var(--color-forest-500)' }}>Reste</p>
              <p className="text-xs font-black font-mono" style={{ color: 'var(--color-forest-700)' }}>
                {formatTimeShort(timeRemaining)}
              </p>
            </div>
            {isOrganizer && (
              <button onClick={() => setShowSettings(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-600)' }}>
                <Settings size={13} />
                <span className="text-[10px] font-bold hidden sm:inline">Config</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
