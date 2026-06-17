import { useState, useCallback } from 'react';
import { useEvent, DEFAULT_SCHEDULE, DEFAULT_TEAM, timeToMinutes, EventConfig } from '../context/EventContext';
import { generateShades, COLOR_PRESETS } from '../utils/colors';
import { safeClear, safeGet, safeRemove } from '../utils/storage';
import {
  X, ChevronDown, ChevronUp, Plus, Trash2, RotateCcw,
  Calendar, Clock, Users, Sparkles,
  Settings as SettingsIcon, AlertTriangle, Building2, Palette,
  Share2, Globe, Copy, ExternalLink, Link2, Check
} from 'lucide-react';

type Section = 'event' | 'colors' | 'time' | 'schedule' | 'team' | 'share' | 'data';

const sections: { id: Section; label: string; emoji: string; icon: React.ReactNode }[] = [
  { id: 'event', label: 'Événement', emoji: '🎉', icon: <Building2 size={16} /> },
  { id: 'colors', label: 'Couleurs', emoji: '🎨', icon: <Palette size={16} /> },
  { id: 'time', label: 'Date & Horaires', emoji: '📅', icon: <Calendar size={16} /> },
  { id: 'schedule', label: 'Programme', emoji: '📋', icon: <Clock size={16} /> },
  { id: 'team', label: 'Équipe', emoji: '👥', icon: <Users size={16} /> },
  { id: 'share', label: 'Mise en ligne', emoji: '🌐', icon: <Globe size={16} /> },
  { id: 'data', label: 'Données', emoji: '🗑️', icon: <AlertTriangle size={16} /> },
];

// Seul un organisateur peut ouvrir les paramètres
export default function SettingsPanel() {
  const { config, showSettings, setShowSettings, isOrganizer } = useEvent();
  const [openSection, setOpenSection] = useState<Section>('event');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!showSettings || !isOrganizer) return null;

  const toggleSection = (id: Section) => {
    setOpenSection(prev => prev === id ? id : id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-forest-100 rounded-xl p-2">
              <SettingsIcon size={18} className="text-forest-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-800">Paramètres</h3>
              <p className="text-[10px] text-gray-400">Configurer votre sortie</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Status badge */}
          <div className="px-4 pt-3">
            <div className={`rounded-xl p-3 border text-xs font-semibold ${
              config.demoMode
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-forest-50 border-forest-200 text-forest-700'
            }`}>
              {config.demoMode ? '🟡 Mode Démo actif' : '🟢 Mode Événement réel'}
              {' — '}
              {config.demoMode
                ? 'L\'application est toujours accessible.'
                : 'L\'application suit les horaires configurés.'}
            </div>
          </div>

          {/* Sections */}
          <div className="p-4 space-y-2">
            {sections.map(section => (
              <div key={section.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">{section.emoji}</span>
                  <span className="flex-1 text-left text-sm font-bold text-gray-700">{section.label}</span>
                  {openSection === section.id ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>

                {openSection === section.id && (
                  <div className="px-3 pb-3 animate-fade-in-up">
                    {section.id === 'event' && <EventSection />}
                    {section.id === 'colors' && <ColorSection />}
                    {section.id === 'time' && <TimeSection />}
                    {section.id === 'schedule' && <ScheduleSection />}
                    {section.id === 'team' && <TeamSection />}
                    {section.id === 'share' && <ShareSection />}
                    {section.id === 'data' && (
                      <DataSection
                        confirmReset={confirmReset}
                        setConfirmReset={setConfirmReset}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer — CRUCIAL : partage du lien */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: '#E8CFCB44' }}>
          {/* Avertissement */}
          <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB74D' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#E65100' }}>
              ⚠️ Partagez le lien pour synchroniser !
            </p>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6B5A5A' }}>
              Les modifications ne sont visibles que dans <strong>votre</strong> navigateur.
              Pour que les participants les voient, vous devez <strong>partager le lien mis à jour</strong>.
            </p>
          </div>

          {/* Bouton partager principal */}
          <ShareUrlButton config={config} />

          {/* Bouton fermer */}
          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-2 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
            style={{ color: '#6B5A5A', border: '1px solid #E8CFCB' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : ÉVÉNEMENT
// ═══════════════════════════════════════════════════════════════
function EventSection() {
  const { config, updateConfig } = useEvent();

  return (
    <div className="space-y-3">
      <Field label="Nom de l'événement" emoji="🎉">
        <input
          type="text"
          value={config.eventName}
          onChange={e => updateConfig({ eventName: e.target.value })}
          className={inputClass}
          placeholder="Sortie Pédagogique"
        />
      </Field>

      <Field label="Association" emoji="🌍">
        <input
          type="text"
          value={config.associationName}
          onChange={e => updateConfig({ associationName: e.target.value })}
          className={inputClass}
          placeholder="Nom de l'association"
        />
      </Field>

      <Field label="Lieu" emoji="📍">
        <input
          type="text"
          value={config.location}
          onChange={e => updateConfig({ location: e.target.value })}
          className={inputClass}
          placeholder="Domaine de Chamarande, Essonne"
        />
      </Field>

      <Field label="Contact (email ou téléphone)" emoji="📞">
        <input
          type="text"
          value={config.contactInfo}
          onChange={e => updateConfig({ contactInfo: e.target.value })}
          className={inputClass}
          placeholder="contact@association.fr"
        />
      </Field>

      <Field label="Message d'accueil" emoji="📝">
        <textarea
          value={config.welcomeMessage}
          onChange={e => updateConfig({ welcomeMessage: e.target.value })}
          className={inputClass + ' resize-none'}
          rows={2}
          placeholder="Description de la sortie..."
        />
      </Field>

      <Field label="Message de fin" emoji="🌅">
        <textarea
          value={config.endMessage}
          onChange={e => updateConfig({ endMessage: e.target.value })}
          className={inputClass + ' resize-none'}
          rows={2}
          placeholder="Message affiché après la sortie..."
        />
       </Field>

      {/* Code organisateur */}
      <div className="rounded-xl p-3" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB74D' }}>
        <Field label="Code organisateur (PIN)" emoji="🔑">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={config.organizerPin}
            onChange={e => updateConfig({ organizerPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            className={inputClass}
            placeholder="1706"
          />
          <p className="text-[10px] mt-1" style={{ color: '#6B5A5A' }}>
            Code à 4 chiffres pour accéder aux paramètres. Partagez-le uniquement avec les organisateurs.
          </p>
        </Field>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : COULEURS
// ═══════════════════════════════════════════════════════════════
function ColorSection() {
  const { config, updateConfig } = useEvent();

  const primaryShades = generateShades(config.primaryColor);
  const accentShades = generateShades(config.accentColor);

  return (
    <div className="space-y-4">
      {/* Aperçu en direct */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-2 block">👁️ Aperçu</label>
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          {/* Header preview */}
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ background: `linear-gradient(to right, ${primaryShades['700']}, ${primaryShades['600']}, ${primaryShades['500']})` }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🌳</span>
              <span className="text-[10px] font-bold text-white">{config.eventName}</span>
            </div>
            <span className="text-[8px] bg-white/20 text-white rounded-full px-1.5 py-0.5 font-bold">DÉMO</span>
          </div>
          {/* Nav preview */}
          <div className="bg-white p-2 flex justify-around">
            {['🏠', '📸', '🌿', '🎨', '💭'].map((e, i) => (
              <div key={i} className={`flex flex-col items-center ${i === 0 ? '' : 'opacity-40'}`}>
                <span className="text-xs">{e}</span>
                {i === 0 && <div className="w-3 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: primaryShades['600'] }} />}
              </div>
            ))}
          </div>
          {/* Palette preview */}
          <div className="flex">
            {['500', '400', '300', '200', '100', '50'].map(shade => (
              <div
                key={shade}
                className="flex-1 h-4 first:rounded-bl-lg"
                style={{ backgroundColor: primaryShades[shade] }}
              />
            ))}
          </div>
          <div className="flex">
            {['500', '400', '300', '200', '100', '50'].map(shade => (
              <div
                key={shade}
                className="flex-1 h-4 last:rounded-br-lg"
                style={{ backgroundColor: accentShades[shade] }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Couleur principale */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-2 block">
          🎨 Couleur principale (en-tête, navigation, boutons)
        </label>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {COLOR_PRESETS.map((preset) => {
            const isActive = config.primaryColor === preset.primary;
            return (
              <button
                key={preset.name}
                onClick={() => updateConfig({
                  primaryColor: preset.primary,
                  accentColor: preset.accent,
                })}
                className={`relative rounded-xl p-2 border-2 transition-all text-center ${
                  isActive
                    ? 'border-gray-800 shadow-md scale-105'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 shadow-inner"
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-[10px] font-bold text-gray-600">{preset.emoji} {preset.name}</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom color picker */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <div
            className="w-10 h-10 rounded-xl shadow-inner border-2 border-white flex-shrink-0"
            style={{ backgroundColor: config.primaryColor }}
          />
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">Couleur personnalisée</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={e => updateConfig({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) updateConfig({ primaryColor: v });
                }}
                className="flex-1 p-1.5 rounded-lg border border-gray-200 text-xs font-mono text-center bg-white focus:border-gray-400 focus:outline-none"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Couleur d'accent */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-2 block">
          ✨ Couleur d'accent (boutons d'action, highlights)
        </label>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <div
            className="w-10 h-10 rounded-xl shadow-inner border-2 border-white flex-shrink-0"
            style={{ backgroundColor: config.accentColor }}
          />
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">Couleur d'accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.accentColor}
                onChange={e => updateConfig({ accentColor: e.target.value })}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={config.accentColor}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) updateConfig({ accentColor: v });
                }}
                className="flex-1 p-1.5 rounded-lg border border-gray-200 text-xs font-mono text-center bg-white focus:border-gray-400 focus:outline-none"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => updateConfig({ primaryColor: '#37C2C7', accentColor: '#EFC0A8' })}
        className="w-full py-2 rounded-xl border border-gray-200 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all"
        style={{ color: '#6B5A5A' }}
      >
        <RotateCcw size={12} />
        Réinitialiser aux couleurs STTDM (Turquoise)
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : DATE & HORAIRES
// ═══════════════════════════════════════════════════════════════
function TimeSection() {
  const { config, updateConfig } = useEvent();

  const eventDate = new Date(config.eventDate + 'T00:00:00');
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-3">
      <Field label="Date de la sortie" emoji="📅">
        <input
          type="date"
          value={config.eventDate}
          onChange={e => updateConfig({ eventDate: e.target.value })}
          className={inputClass}
        />
        <p className="text-[10px] text-gray-400 mt-1 capitalize">{formattedDate}</p>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Début" emoji="🕘">
          <input
            type="time"
            value={config.startTime}
            onChange={e => updateConfig({ startTime: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Fin" emoji="🕞">
          <input
            type="time"
            value={config.endTime}
            onChange={e => updateConfig({ endTime: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="bg-forest-50 rounded-xl p-3 border border-forest-100">
        <p className="text-xs text-forest-700 font-semibold">
          ⏱️ Durée totale : <strong>{
            (() => {
              const diff = timeToMinutes(config.endTime) - timeToMinutes(config.startTime);
              const h = Math.floor(diff / 60);
              const m = diff % 60;
              return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}` : `${m}min`;
            })()
          }</strong>
        </p>
      </div>

      {/* Demo Mode Toggle */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Mode Démo
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px]">
              Toujours accessible, idéal pour tester avant le jour J
            </p>
          </div>
          <button
            onClick={() => updateConfig({ demoMode: !config.demoMode })}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
              config.demoMode ? 'bg-forest-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
              config.demoMode ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Mode info */}
      <div className={`rounded-xl p-3 border text-xs ${
        config.demoMode
          ? 'bg-amber-50 border-amber-100 text-amber-700'
          : 'bg-forest-50 border-forest-100 text-forest-700'
      }`}>
        {config.demoMode ? (
          <>
            <p className="font-bold mb-1">🟡 Mode Démo</p>
            <p className="opacity-80">L'application est toujours en mode LIVE. Désactivez ce mode pour que l'application suive les horaires réels le jour de l'événement.</p>
          </>
        ) : (
          <>
            <p className="font-bold mb-1">🟢 Mode Événement réel</p>
            <p className="opacity-80">
              Avant {config.startTime} → écran d'attente avec compte à rebours<br />
              {config.startTime} – {config.endTime} → application LIVE<br />
              Après {config.endTime} → écran de fin
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : PROGRAMME
// ═══════════════════════════════════════════════════════════════
function ScheduleSection() {
  const { config, updateConfig } = useEvent();
  const schedule = config.schedule;

  const updateScheduleItem = (index: number, updates: Partial<typeof schedule[0]>) => {
    const next = [...schedule];
    next[index] = { ...next[index], ...updates };
    updateConfig({ schedule: next });
  };

  const addScheduleItem = () => {
    const lastTime = schedule.length > 0 ? schedule[schedule.length - 1].time : '09:00';
    const [h, m] = lastTime.split(':').map(Number);
    const newTime = `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    updateConfig({
      schedule: [...schedule, { time: newTime, label: 'Nouvelle activité', emoji: '✨', desc: 'Description...' }]
    });
  };

  const removeScheduleItem = (index: number) => {
    const next = schedule.filter((_, i) => i !== index);
    updateConfig({ schedule: next });
  };

  const moveScheduleItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= schedule.length) return;
    const next = [...schedule];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    updateConfig({ schedule: next });
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 font-semibold">
        Modifiez l'ordre, les horaires et les intitulés des activités.
      </p>

      {schedule.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Activité {i + 1}</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveScheduleItem(i, 'up')}
                disabled={i === 0}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-100"
              >↑</button>
              <button
                onClick={() => moveScheduleItem(i, 'down')}
                disabled={i === schedule.length - 1}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-100"
              >↓</button>
              <button
                onClick={() => removeScheduleItem(i)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-500 hover:bg-red-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[60px_1fr] gap-2">
            <div>
              <label className="text-[10px] text-gray-400 font-semibold">Heure</label>
              <input
                type="time"
                value={item.time}
                onChange={e => updateScheduleItem(i, { time: e.target.value })}
                className={inputSmallClass}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-semibold">Nom</label>
              <input
                type="text"
                value={item.label}
                onChange={e => updateScheduleItem(i, { label: e.target.value })}
                className={inputSmallClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-[48px_1fr] gap-2">
            <div>
              <label className="text-[10px] text-gray-400 font-semibold">Emoji</label>
              <input
                type="text"
                value={item.emoji}
                onChange={e => updateScheduleItem(i, { emoji: e.target.value })}
                className={inputSmallClass}
                maxLength={4}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-semibold">Description</label>
              <input
                type="text"
                value={item.desc}
                onChange={e => updateScheduleItem(i, { desc: e.target.value })}
                className={inputSmallClass}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addScheduleItem}
        className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50/50 transition-all"
      >
        <Plus size={14} />
        Ajouter une activité
      </button>

      {/* Reset to defaults */}
      <button
        onClick={() => updateConfig({ schedule: DEFAULT_SCHEDULE })}
        className="w-full py-2 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:text-forest-600 transition-all"
      >
        <RotateCcw size={12} />
        Réinitialiser le programme par défaut
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : ÉQUIPE
// ═══════════════════════════════════════════════════════════════
function TeamSection() {
  const { config, updateConfig } = useEvent();
  const team = config.team;

  const updateTeamMember = (index: number, updates: Partial<typeof team[0]>) => {
    const next = [...team];
    next[index] = { ...next[index], ...updates };
    updateConfig({ team: next });
  };

  const addTeamMember = () => {
    updateConfig({
      team: [...team, { emoji: '👤', role: 'Nouveau membre' }]
    });
  };

  const removeTeamMember = (index: number) => {
    updateConfig({ team: team.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 font-semibold">
        Les membres de l'équipe d'encadrement affichés sur la page d'accueil.
      </p>

      {team.map((member, i) => (
        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <input
            type="text"
            value={member.emoji}
            onChange={e => updateTeamMember(i, { emoji: e.target.value })}
            className="w-10 h-10 text-center text-lg rounded-lg border border-gray-200 bg-white p-1"
            maxLength={4}
          />
          <input
            type="text"
            value={member.role}
            onChange={e => updateTeamMember(i, { role: e.target.value })}
            className={inputSmallClass + ' flex-1'}
            placeholder="Rôle..."
          />
          <button
            onClick={() => removeTeamMember(i)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={addTeamMember}
        className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50/50 transition-all"
      >
        <Plus size={14} />
        Ajouter un membre
      </button>

      <button
        onClick={() => updateConfig({ team: DEFAULT_TEAM })}
        className="w-full py-2 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:text-forest-600 transition-all"
      >
        <RotateCcw size={12} />
        Réinitialiser l'équipe par défaut
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : MISE EN LIGNE & PARTAGE
// ═══════════════════════════════════════════════════════════════
function ShareSection() {
  const { config, shareableUrl, sync, createCloudRoom } = useEvent();
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt('Copiez ce lien :', shareableUrl);
    }
  }, [shareableUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.eventName} — ${config.associationName}`,
          text: `🌍 Livret interactif pour "${config.eventName}" !\n📍 ${config.location}\nOuvrez ce lien le jour de la sortie.`,
          url: shareableUrl,
        });
      } catch { /* cancelled */ }
    }
  }, [config, shareableUrl]);

  return (
    <div className="space-y-4">
      {/* Explication clé */}
      <div className="rounded-xl p-3 border" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB74D' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#E65100' }}>
          🔗 La synchronisation = le lien !
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#6B5A5A' }}>
          Vos paramètres sont encodés dans l'URL. <strong>Partagez le lien</strong> pour que les participants voient la même configuration que vous. Sans le lien, ils verront les paramètres par défaut.
        </p>
      </div>

      {/* Cloud sync bouton */}
      {!sync.enabled ? (
        <div>
          <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB74D' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#E65100' }}>☁️ Synchronisation automatique</p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#6B5A5A' }}>
              Créez un <strong>room</strong> pour que vos modifications soient <strong>automatiquement</strong> vues par les participants. Plus besoin de renvoyer le lien !
            </p>
          </div>
          <button onClick={async () => { setCreating(true); try { await createCloudRoom(); } catch {} setCreating(false); }}
            disabled={creating}
            className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mb-2"
            style={{ background: 'linear-gradient(to right, #2daeb3, #24969b)' }}>
            {creating ? '⏳ Création...' : '☁️ Activer la synchronisation cloud'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: 'var(--color-forest-50)', border: '1px solid var(--color-forest-100)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-black" style={{ color: 'var(--color-forest-800)' }}>Sync cloud active ✅</span>
          </div>
          <p className="text-[11px]" style={{ color: '#6B5A5A' }}>
            Room : <strong className="text-[11px] break-all font-mono" style={{ color: 'var(--color-forest-700)' }}>{sync.roomId}</strong>
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#6B5A5A', opacity: 0.6 }}>
            Vos modifications sont synchronisées automatiquement.
          </p>
        </div>
      )}

      {/* Lien partageable */}
      <div>
        <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B5A5A' }}>
          🔗 Lien partageable (contient vos paramètres)
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-2.5 rounded-lg text-[10px] font-mono truncate" style={{ backgroundColor: '#F4F4F4', border: '1px solid #E8CFCB44', color: '#6B5A5A' }}>
            {shareableUrl.length > 60 ? shareableUrl.substring(0, 60) + '…' : shareableUrl}
          </div>
          <button onClick={handleCopy}
            className="flex-shrink-0 px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            style={{
              backgroundColor: copied ? 'var(--color-forest-500)' : 'var(--color-forest-50)',
              color: copied ? 'white' : 'var(--color-forest-700)',
              border: `1px solid ${copied ? 'var(--color-forest-500)' : 'var(--color-forest-200)'}`,
            }}>
            {copied ? '✅ Copié !' : <><Copy size={13} /> Copier</>}
          </button>
        </div>
      </div>

      {/* Partage natif */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button onClick={handleNativeShare}
          className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(to right, var(--color-forest-500), var(--color-forest-600))' }}>
          <Share2 size={16} /> Partager via message, email…
        </button>
      )}

      {/* QR Code */}
      <div className="rounded-xl p-3 border" style={{ backgroundColor: '#F4F4F4', borderColor: '#E8CFCB44' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#6B5A5A' }}>📲 QR Code pour le jour J</p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#6B5A5A' }}>
          Créez un QR Code gratuit sur <strong>qr-code-generator.com</strong> avec le lien ci-dessus. Imprimez-le et affichez-le le jour de la sortie !
        </p>
      </div>

      {/* Hébergement */}
      <div>
        <p className="text-xs font-bold mb-2" style={{ color: '#6B5A5A' }}>
          🚀 Héberger l'application (gratuit)
        </p>
        <div className="space-y-2">
          <DeployOption
            name="Netlify Drop — LE PLUS SIMPLE"
            emoji="⭐"
            url="https://app.netlify.com/drop"
            steps={[
              'Cliquez sur "Build" en haut de cette page pour générer les fichiers',
              'Allez sur app.netlify.com/drop',
              'Glissez le dossier "dist" sur la page',
              'Votre app est en ligne en 10 secondes !',
            ]}
          />
          <DeployOption
            name="Cloudflare Pages"
            emoji="☁️"
            url="https://dash.cloudflare.com"
            steps={[
              'Allez sur dash.cloudflare.com → Workers & Pages',
              'Créez un projet → "Direct Upload"',
              'Uploadez le contenu du dossier "dist/"',
              'NE PAS utiliser le dépôt Git (ça plante)',
            ]}
          />
          <DeployOption
            name="GitHub Pages"
            emoji="🐙"
            url="https://pages.github.com"
            steps={[
              'Créez un repo GitHub',
              'Uploadez les fichiers du dossier "dist/"',
              'Activez GitHub Pages dans Settings',
            ]}
          />
          <DeployOption
            name="Télécharger le fichier HTML"
            emoji="📁"
            url=""
            steps={[
              'Cliquez "Télécharger" ci-dessous',
              'Envoyez le fichier HTML par email',
              'Les participants l\'ouvrent dans leur navigateur',
              '⚠️ Fonctionne mais certaines fonctions limitées',
            ]}
          />
        </div>
      </div>

      {/* Note importante */}
      <div className="rounded-xl p-3 border" style={{ backgroundColor: '#E8CFCB22', borderColor: '#E8CFCB44' }}>
        <p className="text-[10px] leading-relaxed" style={{ color: '#6B5A5A' }}>
          ⚠️ <strong>Données par participant :</strong> Chaque personne a sa propre version du livret. Les photos, dessins et bilans restent sur leur téléphone.
        </p>
      </div>
    </div>
  );
}

function DeployOption({ name, emoji, url, steps }: {
  name: string;
  emoji: string;
  url: string;
  steps: string[];
}) {
  return (
    <details className="rounded-xl border overflow-hidden" style={{ borderColor: '#E8CFCB44' }}>
      <summary className="p-2.5 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors text-xs font-bold" style={{ color: '#6B5A5A' }}>
        <span className="text-base">{emoji}</span>
        <span className="flex-1">{name}</span>
        {url && <ExternalLink size={12} className="opacity-40" />}
      </summary>
      <div className="px-3 pb-3 pt-1">
        <ol className="space-y-1">
          {steps.map((step, i) => (
            <li key={i} className="text-[11px] flex gap-2" style={{ color: '#6B5A5A' }}>
              <span className="font-bold flex-shrink-0" style={{ color: 'var(--color-forest-600)' }}>{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold mt-2 hover:underline"
              style={{ color: 'var(--color-forest-600)' }}
            >
              <ExternalLink size={11} /> Ouvrir {name}
            </a>
          )}
        </ol>
      </div>
    </details>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🔗 BOUTON DE PARTAGE D'URL (composant clé !)
// ═══════════════════════════════════════════════════════════════
function ShareUrlButton({ config }: { config: EventConfig }) {
  const { shareableUrl } = useEvent();
  const [copied, setCopied] = useState(false);
  const url = shareableUrl;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      prompt('Copiez ce lien :', url);
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.eventName} — ${config.associationName}`,
          text: `🌍 Livret interactif pour "${config.eventName}" ! Ouvrez ce lien le jour de la sortie.`,
          url,
        });
      } catch { /* cancelled */ }
    }
  }, [config, url]);

  return (
    <div className="space-y-2">
      {/* URL preview */}
      <div className="flex items-center gap-2">
        <div className="flex-1 p-2 rounded-lg text-[10px] font-mono truncate"
          style={{ backgroundColor: '#F4F4F4', color: '#6B5A5A', border: '1px solid #E8CFCB44' }}>
          {url.length > 80 ? url.substring(0, 80) + '…' : url}
        </div>
        <button onClick={handleCopy}
          className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          style={{
            backgroundColor: copied ? 'var(--color-forest-500)' : 'var(--color-forest-50)',
            color: copied ? 'white' : 'var(--color-forest-700)',
            border: `1px solid ${copied ? 'var(--color-forest-500)' : 'var(--color-forest-200)'}`,
          }}>
          {copied ? <><Check size={13} /> Copié !</> : <><Copy size={13} /> Copier</>}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button onClick={handleNativeShare}
            className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(to right, var(--color-forest-500), var(--color-forest-600))' }}>
            <Share2 size={16} /> Partager le lien
          </button>
        )}
        <button onClick={handleCopy}
          className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ border: '2px solid var(--color-forest-400)', color: 'var(--color-forest-700)' }}>
          <Link2 size={16} /> Copier le lien
        </button>
      </div>

      <p className="text-[9px] text-center leading-relaxed" style={{ color: '#6B5A5A', opacity: 0.5 }}>
        📱 Envoyez ce lien par message, email ou QR code.<br />
        Les participants qui l'ouvrent verront vos paramètres.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION : DONNÉES
// ═══════════════════════════════════════════════════════════════
function DataSection({ confirmReset, setConfirmReset }: {
  confirmReset: boolean;
  setConfirmReset: (v: boolean) => void;
}) {

  const handleFullReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    safeClear();
    window.location.reload();
  };

  const handleResetPhotos = () => {
    // Clear only photo-related data
    const keys: string[] = [];
    // Can't iterate localStorage on file://, so clear known keys
    ['photo_rally', 'drawing_data', 'bilan_data', 'exploration_data'].forEach(k => {
      if (safeGet(k)) keys.push(k);
    });
    keys.forEach(k => safeRemove(k));
    setConfirmReset(false);
  };

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
        <p className="text-xs text-amber-700 leading-relaxed">
          ⏳ <strong>Appli éphémère :</strong> Toutes les données sont stockées localement dans votre navigateur.
          Elles ne sont pas envoyées sur un serveur.
        </p>
      </div>

      <button
        onClick={handleResetPhotos}
        className="w-full py-2.5 rounded-xl border-2 border-amber-200 text-amber-600 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-amber-50 transition-all"
      >
        <RotateCcw size={14} />
        Effacer photos et dessins
      </button>

      <div className="border-t border-gray-100 pt-3">
        {!confirmReset ? (
          <button
            onClick={handleFullReset}
            className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
          >
            <AlertTriangle size={14} />
            Tout réinitialiser (configuration + données)
          </button>
        ) : (
          <div className="bg-red-50 rounded-xl p-3 border border-red-200">
            <p className="text-xs text-red-700 font-bold mb-2">
              ⚠️ Êtes-vous sûr ? Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleFullReset}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors"
              >
                Oui, tout effacer
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function Field({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
        <span>{emoji}</span> {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = 'w-full p-2.5 rounded-xl border-2 border-gray-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-100 text-sm transition-all outline-none bg-white';
const inputSmallClass = 'w-full p-2 rounded-lg border border-gray-200 focus:border-forest-400 focus:ring-1 focus:ring-forest-100 text-xs transition-all outline-none bg-white';
