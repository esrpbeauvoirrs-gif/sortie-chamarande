import { useState, useCallback, useRef } from 'react';
import { Volume2, Eye, Ear, Hand, Flower2, UtensilsCrossed } from 'lucide-react';

// ===== SENSORY WALK =====
interface SenseItem {
  sense: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  question: string;
  prompts: string[];
}

const senses: SenseItem[] = [
  {
    sense: 'La Vue',
    emoji: '👀',
    icon: <Eye size={18} />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    question: 'Qu\'est-ce que tu vois ?',
    prompts: ['Je vois...', 'C\'est de couleur...', 'Je remarque que...'],
  },
  {
    sense: 'L\'Ouïe',
    emoji: '👂',
    icon: <Ear size={18} />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    question: 'Qu\'est-ce que tu entends ?',
    prompts: ['J\'entends...', 'C\'est un bruit de...', 'Ça sonne comme...'],
  },
  {
    sense: 'Le Toucher',
    emoji: '🤚',
    icon: <Hand size={18} />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    question: 'Qu\'est-ce que tu touches ?',
    prompts: ['C\'est doux / rugueux', 'C\'est lisse / granuleux', 'C\'est chaud / froid'],
  },
  {
    sense: 'L\'Odorat',
    emoji: '👃',
    icon: <Flower2 size={18} />,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    question: 'Qu\'est-ce que tu sens ?',
    prompts: ['Ça sent...', 'C\'est une odeur de...', 'C\'est agréable / désagréable'],
  },
  {
    sense: 'Le Goût',
    emoji: '👅',
    icon: <UtensilsCrossed size={18} />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    question: 'Pendant le pique-nique, que goûtes-tu ?',
    prompts: ['C\'est sucré / salé', 'C\'est bon !', 'Je goûte...'],
  },
];

// ===== PICNIC PHRASES =====
interface PhraseItem {
  french: string;
  translation: string;
  emoji: string;
  category: string;
}

const phrases: PhraseItem[] = [
  { french: 'Bonjour ! Comment ça va ?', translation: 'Hello! How are you?', emoji: '👋', category: 'Salutations' },
  { french: 'Je m\'appelle...', translation: 'My name is...', emoji: '🤝', category: 'Salutations' },
  { french: 'Enchanté(e) !', translation: 'Nice to meet you!', emoji: '😊', category: 'Salutations' },
  { french: 'Tu as faim ?', translation: 'Are you hungry?', emoji: '🍽️', category: 'Pique-nique' },
  { french: 'Je partage mon pain.', translation: 'I share my bread.', emoji: '🥖', category: 'Pique-nique' },
  { french: 'Est-ce que tu veux goûter ?', translation: 'Do you want to taste?', emoji: '😋', category: 'Pique-nique' },
  { french: 'C\'est délicieux !', translation: 'It\'s delicious!', emoji: '👍', category: 'Pique-nique' },
  { french: 'Merci beaucoup !', translation: 'Thank you very much!', emoji: '🙏', category: 'Politesse' },
  { french: 'S\'il vous plaît', translation: 'Please', emoji: '💫', category: 'Politesse' },
  { french: 'Excusez-moi', translation: 'Excuse me', emoji: '🙋', category: 'Politesse' },
  { french: 'Quel beau paysage !', translation: 'What a beautiful landscape!', emoji: '🏔️', category: 'Nature' },
  { french: 'Regarde ! Là-bas !', translation: 'Look! Over there!', emoji: '👉', category: 'Nature' },
  { french: 'J\'aime bien cet endroit.', translation: 'I like this place.', emoji: '❤️', category: 'Nature' },
  { french: 'Tu veux jouer avec moi ?', translation: 'Do you want to play with me?', emoji: '⚽', category: 'Activités' },
  { french: 'On fait une photo ensemble ?', translation: 'Shall we take a photo together?', emoji: '📸', category: 'Activités' },
];

type SubTab = 'sens' | 'phrases';

export default function Exploration() {
  const [subTab, setSubTab] = useState<SubTab>('sens');
  const [senseAnswers, setSenseAnswers] = useState<Record<string, string>>({});
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleSpeak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingPhrase === text) {
        setSpeakingPhrase(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => setSpeakingPhrase(null);
      utteranceRef.current = utterance;
      setSpeakingPhrase(text);
      window.speechSynthesis.speak(utterance);
    }
  }, [speakingPhrase]);

  const categories = [...new Set(phrases.map(p => p.category))];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white px-6 py-6">
        <div className="text-center">
          <span className="text-4xl block mb-2">🌿</span>
          <h2 className="text-2xl font-black">Exploration</h2>
          <p className="text-sm opacity-90 mt-1">Utilise tes sens et apprends du vocabulaire !</p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="px-4 pt-3">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setSubTab('sens')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              subTab === 'sens'
                ? 'bg-white text-forest-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            👁️ Les 5 Sens
          </button>
          <button
            onClick={() => setSubTab('phrases')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              subTab === 'phrases'
                ? 'bg-white text-forest-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            💬 Phrases Utiles
          </button>
        </div>
      </div>

      {subTab === 'sens' ? (
        <div className="px-4 py-4 space-y-3">
          <div className="bg-forest-50 rounded-xl p-3 border border-forest-100">
            <p className="text-xs text-forest-700 font-semibold leading-relaxed">
              🌿 <strong>Consigne :</strong> Pendant la balade, utilise tes 5 sens pour observer et décrire ce qui t'entoure. Écris tes observations !
            </p>
          </div>

          {senses.map((sense, index) => (
            <div
              key={sense.sense}
              className={`${sense.bgColor} rounded-2xl p-4 border ${sense.borderColor} animate-slide-in`}
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{sense.emoji}</span>
                <h4 className={`font-black text-base ${sense.color}`}>{sense.sense}</h4>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{sense.question}</p>
              
              {/* Prompt chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {sense.prompts.map((prompt, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-white/60 rounded-full px-2 py-0.5 font-semibold text-gray-600 border border-white"
                  >
                    {prompt}
                  </span>
                ))}
              </div>

              <textarea
                value={senseAnswers[sense.sense] || ''}
                onChange={e => setSenseAnswers(prev => ({ ...prev, [sense.sense]: e.target.value }))}
                placeholder="Écris ce que tu observes..."
                className="w-full p-2.5 rounded-xl border-2 border-white bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-forest-200 transition-all"
                rows={2}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              🔊 <strong>Conseil :</strong> Appuie sur le bouton 🔊 pour écouter la prononciation en français. Répète après !
            </p>
          </div>

          {categories.map((category) => (
            <div key={category}>
              <h4 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                {category}
              </h4>
              <div className="space-y-2">
                {phrases.filter(p => p.category === category).map((phrase, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 p-3">
                      <span className="text-xl flex-shrink-0">{phrase.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800">{phrase.french}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 italic">{phrase.translation}</p>
                      </div>
                      <button
                        onClick={() => handleSpeak(phrase.french)}
                        className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                          speakingPhrase === phrase.french
                            ? 'bg-forest-500 text-white'
                            : 'bg-forest-50 text-forest-600 hover:bg-forest-100'
                        }`}
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
