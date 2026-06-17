import { Clock, Camera, Check } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { generateShades } from '../utils/colors';

function isFileProtocol(): boolean {
  try { return window.location.protocol === 'file:'; } catch { return false; }
}

interface WelcomeProps {
  onStartRally: () => void;
}

export default function Welcome({ onStartRally }: WelcomeProps) {
  const { config, currentActivityIndex, progressPercent, isFromUrl } = useEvent();
  const schedule = config.schedule;
  const accentShades = generateShades(config.accentColor);

  return (
    <div className="max-w-2xl mx-auto">
      {/* ═══ Hero STTDM ═══ */}
      <div className="relative overflow-hidden">
        <div className="text-white px-6 py-8 pb-10"
          style={{ background: `linear-gradient(135deg, var(--color-forest-800), var(--color-forest-600), var(--color-forest-400))` }}
        >
          {/* Chevron diagonal STTDM */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 14px, white 14px, white 22px)`,
          }} />

          <div className="text-center relative z-10">
            {/* V / Chevron symbolisant le toit */}
            <div className="flex justify-center mb-3">
              <svg width="48" height="28" viewBox="0 0 48 28" fill="none" className="opacity-80">
                <path d="M24 0L48 28H32L24 16L16 28H0L24 0Z" fill="white" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {config.eventName}
            </h2>
            <h3 className="text-base font-semibold opacity-90"
              style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
              {config.location}
            </h3>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-sm opacity-80">
              <span>🌍</span>
              <span style={{ fontFamily: 'Cinzel, serif' }}>{config.associationName}</span>
            </div>

            {/* Progress bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-white/70 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[10px] opacity-60 mt-1">
              {schedule[currentActivityIndex]?.emoji} En cours : {schedule[currentActivityIndex]?.label}
            </p>
          </div>
        </div>

        {/* Vague décorative avec rose poudré */}
        <div className="h-6 -mt-1" style={{ background: `linear-gradient(135deg, var(--color-forest-800), var(--color-forest-600), var(--color-forest-400))` }}>
          <svg viewBox="0 0 1440 40" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 C360,40 1080,40 1440,0 L1440,40 L0,40 Z" fill="var(--color-cream)" />
          </svg>
        </div>
      </div>

      {/* Bande éphémère */}
      <div className="px-4 -mt-2 mb-3">
        <div className="rounded-xl p-2.5 flex items-center gap-2"
          style={{ backgroundColor: '#F0D7BE33', border: '1px solid #EFC0A855' }}>
          <span className="text-lg">⏳</span>
          <p className="text-[10px] font-semibold leading-snug" style={{ color: '#6B5A5A' }}>
            Appli éphémère — Active uniquement le jour de la sortie !
          </p>
        </div>
      </div>

      {/* Confirmation config partagée */}
      {isFromUrl && (
        <div className="px-4 mb-3">
          <div className="rounded-xl p-2.5 flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-forest-50)', border: '1px solid var(--color-forest-100)' }}>
            <span className="text-lg">✅</span>
            <div>
              <p className="text-[10px] font-semibold leading-snug" style={{ color: 'var(--color-forest-800)' }}>
                Livret configuré par l'organisateur
              </p>
              <p className="text-[9px] leading-snug mt-0.5" style={{ color: '#6B5A5A', opacity: 0.6 }}>
                Si l'organisateur modifie les paramètres, il vous enverra un nouveau lien.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement si ouvert en fichier local */}
      {isFileProtocol() && (
        <div className="px-4 mb-3">
          <div className="rounded-xl p-3 flex items-start gap-2"
            style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB74D' }}>
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-xs font-bold" style={{ color: '#E65100' }}>
                Fichier ouvert en local
              </p>
              <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#6B5A5A' }}>
                Certaines fonctionnalités (sauvegarde, partage) peuvent être limitées.
                Pour une expérience complète, hébergez ce fichier en ligne via
                <strong> Paramétrer → Mise en ligne</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Carte Association */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4" style={{ border: '1px solid var(--color-forest-100)' }}>
          <div className="flex items-start gap-3">
            <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--color-forest-50)' }}>
              <span className="text-3xl">🌍</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm" style={{ color: 'var(--color-forest-800)' }}>Organisé par</h4>
              <p className="font-extrabold text-base" style={{ color: 'var(--color-forest-700)', fontFamily: 'Cinzel, serif' }}>
                « {config.associationName} »
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6B5A5A' }}>
                {config.welcomeMessage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Équipe */}
      {config.team.length > 0 && (
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(to right, #E8CFCB22, #F0D7BE33)', border: '1px solid #E8CFCB44' }}>
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: '#6B5A5A' }}>
              <span>👥</span> L'équipe d'encadrement
            </h4>
            <div className={`grid gap-2 ${
              config.team.length <= 2 ? 'grid-cols-2' :
              config.team.length === 3 ? 'grid-cols-3' :
              config.team.length === 4 ? 'grid-cols-4' :
              'grid-cols-3'
            }`}>
              {config.team.map((member, i) => (
                <div key={i} className="bg-white/70 rounded-xl p-2 text-center">
                  <span className="text-xl">{member.emoji}</span>
                  <p className="text-[10px] font-bold mt-1" style={{ color: '#6B5A5A' }}>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      {config.contactInfo && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-3 flex items-center gap-2" style={{ border: '1px solid #E8CFCB33' }}>
            <span>📞</span>
            <p className="text-xs font-semibold" style={{ color: '#6B5A5A' }}>{config.contactInfo}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 mb-4">
        <button
          onClick={onStartRally}
          className="w-full text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          style={{
            background: `linear-gradient(to right, ${accentShades['400']}, ${accentShades['500']})`,
            boxShadow: `0 8px 24px ${accentShades['200']}`,
          }}
        >
          <Camera size={22} />
          Commencer le Rallye Photo !
        </button>
      </div>

      {/* Programme avec timeline */}
      <div className="px-4 pb-6">
        <h3 className="font-black text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--color-forest-800)' }}>
          <Clock size={20} />
          Programme de la Journée
        </h3>
        <div className="relative">
          <div className="absolute left-[26px] top-4 bottom-4 w-0.5" style={{ backgroundColor: 'var(--color-forest-200)' }} />

          <div className="space-y-2">
            {schedule.map((item, index) => {
              const isCurrent = index === currentActivityIndex;
              const isPast = index < currentActivityIndex;

              return (
                <div key={index} className="animate-slide-in relative"
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}>
                  <div className={`flex gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent ? 'shadow-md' : isPast ? 'opacity-60' : ''
                  }`} style={{
                    borderColor: isCurrent ? 'var(--color-forest-400)' : isPast ? '#E8CFCB' : '#E8CFCB44',
                    backgroundColor: isCurrent ? 'var(--color-forest-50)' : isPast ? '#F4F4F4' : 'white',
                    ...(isCurrent ? { boxShadow: '0 0 0 2px var(--color-forest-200)' } : {}),
                  }}>
                    <div className="flex flex-col items-center relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm relative z-10 ${
                        isCurrent ? 'text-white shadow-lg' : ''
                      }`} style={{
                        backgroundColor: isCurrent ? 'var(--color-forest-500)' : isPast ? 'var(--color-forest-200)' : '#E8CFCB',
                        color: isCurrent ? 'white' : isPast ? 'var(--color-forest-700)' : '#6B5A5A',
                      }}>
                        {isPast ? <Check size={16} strokeWidth={3} /> : item.emoji}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm" style={{
                          color: isCurrent ? 'var(--color-forest-800)' : isPast ? '#6B5A5A' : '#6B5A5A',
                          textDecoration: isPast ? 'line-through' : 'none',
                          opacity: isPast ? 0.5 : 1,
                        }}>
                          {item.label}
                        </h4>
                        {isCurrent && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-forest-400)' }} />
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--color-forest-500)' }} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#6B5A5A', opacity: isPast ? 0.5 : isCurrent ? 0.8 : 0.6 }}>
                        {item.desc}
                      </p>
                      <span className="text-[10px] font-bold mt-0.5 inline-block" style={{ color: isCurrent ? 'var(--color-forest-600)' : '#6B5A5A', opacity: 0.5 }}>
                        {item.time.replace(':', 'h')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
