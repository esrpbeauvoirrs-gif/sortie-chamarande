import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check, RotateCcw, ChevronDown, Sparkles } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { generateShades } from '../utils/colors';

interface PhotoChallenge {
  id: number;
  emoji: string;
  instruction: string;
  hint: string;
  example: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const challenges: PhotoChallenge[] = [
  {
    id: 1,
    emoji: '🔴',
    instruction: 'Quelque chose de ROND',
    hint: 'Cherche une forme ronde dans la nature',
    example: 'Le soleil est rond.',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 2,
    emoji: '🟥',
    instruction: 'Quelque chose de ROUGE',
    hint: 'Regarde les fleurs, les fruits, les feuilles...',
    example: 'J\'ai trouvé une fleur rouge.',
    color: 'text-red-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  {
    id: 3,
    emoji: '🌵',
    instruction: 'Quelque chose qui PIQUE',
    hint: 'Attention aux épines ! Les orties, les ronces...',
    example: 'Cette plante pique.',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 4,
    emoji: '🪶',
    instruction: 'Quelque chose de DOUX',
    hint: 'Touche délicatement les feuilles, les pétales...',
    example: 'Cette feuille est douce.',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 5,
    emoji: '🐿️',
    instruction: 'Un ANIMAL',
    hint: 'Regarde en l\'air et sur le sol. Un oiseau, un insecte...',
    example: 'J\'ai vu un oiseau sur l\'arbre.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 6,
    emoji: '🌳',
    instruction: 'Quelque chose de GRAND',
    hint: 'Lève les yeux ! Les arbres, le château...',
    example: 'Le château est très grand.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 7,
    emoji: '🐜',
    instruction: 'Quelque chose de PETIT',
    hint: 'Regarde de plus près ! Un caillou, une fourmi...',
    example: 'J\'ai trouvé une petite fleur.',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  {
    id: 8,
    emoji: '🌸',
    instruction: 'Une FLEUR',
    hint: 'Quelle est sa couleur ? Combien de pétales ?',
    example: 'Cette fleur est belle et rose.',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
];

interface ChallengeData {
  photo: string | null;
  sentence: string;
  completed: boolean;
}

export default function PhotoRally() {
  const { config } = useEvent();
  const accentShades = generateShades(config.accentColor);

  const [challengeData, setChallengeData] = useState<Record<number, ChallengeData>>(() => {
    const initial: Record<number, ChallengeData> = {};
    challenges.forEach(c => {
      initial[c.id] = { photo: null, sentence: '', completed: false };
    });
    return initial;
  });
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const completedCount = Object.values(challengeData).filter(d => d.completed).length;
  const progress = (completedCount / challenges.length) * 100;

  const handlePhotoUpload = useCallback((challengeId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target?.result as string;
      setChallengeData(prev => ({
        ...prev,
        [challengeId]: { ...prev[challengeId], photo: photoUrl }
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemovePhoto = useCallback((challengeId: number) => {
    setChallengeData(prev => ({
      ...prev,
      [challengeId]: { ...prev[challengeId], photo: null, completed: false }
    }));
  }, []);

  const handleSentenceChange = useCallback((challengeId: number, sentence: string) => {
    setChallengeData(prev => ({
      ...prev,
      [challengeId]: { ...prev[challengeId], sentence }
    }));
  }, []);

  const handleComplete = useCallback((challengeId: number) => {
    setChallengeData(prev => ({
      ...prev,
      [challengeId]: { ...prev[challengeId], completed: !prev[challengeId].completed }
    }));
  }, []);

  const handleReset = useCallback(() => {
    const initial: Record<number, ChallengeData> = {};
    challenges.forEach(c => {
      initial[c.id] = { photo: null, sentence: '', completed: false };
    });
    setChallengeData(initial);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div
        className="text-white px-6 py-6"
        style={{ background: `linear-gradient(to bottom right, ${accentShades['400']}, ${accentShades['500']}, ${accentShades['600']})` }}
      >
        <div className="text-center">
          <span className="text-4xl block mb-2">📸</span>
          <h2 className="text-2xl font-black">Mon Rallye Photo</h2>
          <p className="text-sm opacity-90 mt-1">Explore et photographie le domaine !</p>
        </div>
        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs mt-1.5 font-semibold">
          {completedCount} / {challenges.length} défis complétés
          {completedCount === challenges.length && ' 🎉'}
        </p>
      </div>

      {/* Challenges */}
      <div className="px-4 py-4 space-y-3">
        {challenges.map((challenge, index) => {
          const data = challengeData[challenge.id];
          const isExpanded = expandedId === challenge.id;
          const hasPhoto = data.photo !== null;

          return (
            <div
              key={challenge.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                data.completed
                  ? 'border-forest-400 bg-forest-50/50'
                  : `${challenge.borderColor} bg-white`
              } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Challenge Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <span className="text-3xl">{challenge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm ${challenge.color}`}>
                      {challenge.instruction}
                    </span>
                    {data.completed && (
                      <span className="bg-forest-500 text-white rounded-full p-0.5">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  {!isExpanded && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{challenge.hint}</p>
                  )}
                </div>
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} className="text-gray-400" />
                </span>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 animate-fade-in-up">
                  {/* Hint */}
                  <div className={`${challenge.bgColor} rounded-xl p-2.5 border ${challenge.borderColor}`}>
                    <p className="text-xs font-semibold text-gray-600">
                      💡 <strong>Consigne :</strong> {challenge.hint}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ✏️ <strong>Exemple :</strong> <em>{challenge.example}</em>
                    </p>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={el => { fileInputRefs.current[challenge.id] = el; }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(challenge.id, file);
                      }}
                      className="hidden"
                    />
                    {hasPhoto ? (
                      <div className="relative rounded-xl overflow-hidden shadow-md">
                        <img
                          src={data.photo!}
                          alt={`Photo pour: ${challenge.instruction}`}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => handleRemovePhoto(challenge.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
                          {challenge.emoji} {challenge.instruction}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRefs.current[challenge.id]?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50/50 transition-all"
                        >
                          <Camera size={20} />
                          <span className="text-xs font-bold">Prendre une photo</span>
                        </button>
                        <button
                          onClick={() => fileInputRefs.current[challenge.id]?.click()}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50/50 transition-all"
                        >
                          <Upload size={20} />
                          <span className="text-xs font-bold">Galerie</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sentence Input */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">
                      ✏️ Écris une phrase pour décrire ta photo :
                    </label>
                    <textarea
                      value={data.sentence}
                      onChange={e => handleSentenceChange(challenge.id, e.target.value)}
                      placeholder={challenge.example}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-100 text-sm resize-none transition-all outline-none"
                      rows={2}
                    />
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => handleComplete(challenge.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      data.completed
                        ? 'bg-forest-500 text-white hover:bg-forest-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-forest-50 hover:text-forest-600'
                    }`}
                  >
                    {data.completed ? (
                      <>
                        <Check size={16} />
                        Complété !
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Marquer comme complété
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Reset Button */}
        {completedCount > 0 && (
          <div className="pt-2">
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-400 font-semibold text-xs flex items-center justify-center gap-2 hover:border-red-300 hover:text-red-500 transition-all"
            >
              <RotateCcw size={14} />
              Recommencer le rallye
            </button>
          </div>
        )}

        {/* Celebration */}
        {completedCount === challenges.length && (
          <div className="bg-gradient-to-br from-forest-50 to-amber-50 rounded-2xl p-6 text-center border-2 border-forest-200 animate-fade-in-up">
            <span className="text-5xl block mb-3">🏆</span>
            <h3 className="text-xl font-black text-forest-700">Bravo !</h3>
            <p className="text-sm text-forest-600 mt-1">
              Tu as complété tous les défis du rallye photo ! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
