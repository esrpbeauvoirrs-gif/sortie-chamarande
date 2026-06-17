import { useState, useCallback, useRef } from 'react';
import { Camera, Heart, Star, MessageCircle, Upload, X, Send } from 'lucide-react';

// Emotion options
interface Emotion {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const emotions: Emotion[] = [
  { id: 'content', emoji: '😊', label: 'Content(e)', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'emerveille', emoji: '🤩', label: 'Émerveillé(e)', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'curieux', emoji: '🤔', label: 'Curieux(se)', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'calme', emoji: '😌', label: 'Calme', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'fatigue', emoji: '😴', label: 'Fatigué(e)', color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { id: 'joyeux', emoji: '😄', label: 'Joyeux(se)', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'reconnaissant', emoji: '🙏', label: 'Reconnaissant(e)', color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { id: 'inspire', emoji: '✨', label: 'Inspiré(e)', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'excite', emoji: '🥳', label: 'Excité(e)', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { id: 'serein', emoji: '🧘', label: 'Serein(e)', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
];

// Sentence completions
interface CompletionItem {
  id: number;
  start: string;
  placeholder: string;
  emoji: string;
}

const completions: CompletionItem[] = [
  { id: 1, start: "Aujourd'hui, j'ai appris...", placeholder: "un nouveau mot, une plante...", emoji: '📖' },
  { id: 2, start: "J'ai aimé...", placeholder: "le rallye photo, le dessin...", emoji: '❤️' },
  { id: 3, start: "J'ai découvert...", placeholder: "un endroit, un arbre...", emoji: '🔍' },
  { id: 4, start: "Je veux retenir de cette journée...", placeholder: "un souvenir, un moment...", emoji: '💫' },
  { id: 5, start: "La prochaine fois, j'aimerais...", placeholder: "revenir, refaire un rallye...", emoji: '🌟' },
];

export default function BilanEmotions() {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleEmotion = useCallback((id: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(id)) {
        return prev.filter(e => e !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handlePhotoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setGroupPhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-8">
          <div className="text-center animate-fade-in-up">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-forest-700 mb-2">Merci {name} !</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Ton bilan a été enregistré. Merci pour cette belle journée au Domaine de Chamarande ! 
            </p>

            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-lg p-5 text-left space-y-4 mb-6">
              <h3 className="font-bold text-forest-700 text-center text-sm">Ton résumé de la journée</h3>
              
              {name && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-semibold text-gray-700">{name}</span>
                </div>
              )}

              {selectedEmotions.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5">Mes émotions :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmotions.map(id => {
                      const emotion = emotions.find(e => e.id === id);
                      return emotion ? (
                        <span key={id} className={`${emotion.bgColor} ${emotion.borderColor} border rounded-full px-2 py-0.5 text-xs font-bold ${emotion.color}`}>
                          {emotion.emoji} {emotion.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {Object.entries(answers).filter(([, v]) => v.trim()).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500">Mes réflexions :</p>
                  {completions.filter(c => answers[c.id]?.trim()).map(c => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-700">
                        {c.emoji} <strong>{c.start}</strong> {answers[c.id]}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {groupPhoto && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5">Notre photo souvenir :</p>
                  <img src={groupPhoto} alt="Photo de groupe" className="rounded-xl w-full" />
                </div>
              )}
            </div>

            <button
              onClick={() => setSubmitted(false)}
              className="text-sm font-semibold text-forest-600 hover:text-forest-700 underline"
            >
              Modifier mon bilan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-red-400 text-white px-6 py-6">
        <div className="text-center">
          <span className="text-4xl block mb-2">💭</span>
          <h2 className="text-2xl font-black">Bilan de la Journée</h2>
          <p className="text-sm opacity-90 mt-1">Comment te sens-tu ? Partage tes émotions !</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="text-sm font-bold text-gray-700 mb-2 block">
            👤 Ton prénom :
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Écris ton prénom..."
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-forest-400 focus:ring-2 focus:ring-forest-100 text-sm transition-all outline-none"
          />
        </div>

        {/* Emotions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
            <Heart size={16} className="text-rose-500" />
            Mes émotions aujourd'hui
          </h3>
          <p className="text-xs text-gray-400 mb-3">Choisis une ou plusieurs émotions :</p>
          <div className="grid grid-cols-2 gap-2">
            {emotions.map((emotion) => {
              const isSelected = selectedEmotions.includes(emotion.id);
              return (
                <button
                  key={emotion.id}
                  onClick={() => toggleEmotion(emotion.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${emotion.bgColor} ${emotion.borderColor} ${emotion.color} shadow-sm scale-[1.02]`
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <span className="text-xl">{emotion.emoji}</span>
                  <span className="text-xs font-bold">{emotion.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sentence Completions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
            <MessageCircle size={16} className="text-blue-500" />
            Je complète les phrases
          </h3>
          <p className="text-xs text-gray-400 mb-3">Exprime-toi !</p>
          <div className="space-y-3">
            {completions.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  {item.emoji} {item.start}
                </label>
                <textarea
                  value={answers[item.id] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder={item.placeholder}
                  className="w-full p-2 rounded-lg border border-gray-200 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-forest-100 focus:border-forest-300 transition-all bg-white"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Group Photo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
            <Camera size={16} className="text-amber-500" />
            Photo de groupe souvenir
          </h3>
          <p className="text-xs text-gray-400 mb-3">Ajoute la photo prise tous ensemble :</p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
            className="hidden"
          />
          {groupPhoto ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={groupPhoto} alt="Photo de groupe" className="w-full rounded-xl" />
              <button
                onClick={() => setGroupPhoto(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/50 transition-all flex flex-col items-center gap-2"
            >
              <Upload size={28} />
              <span className="text-xs font-bold">Ajouter la photo de groupe</span>
            </button>
          )}
        </div>

        {/* Star Rating */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100">
          <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            Note ta journée
          </h3>
          <StarRating />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          <Send size={20} />
          Envoyer mon bilan
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
}

// Star Rating sub-component
function StarRating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const labels = ['', 'Pas terrible 😕', 'Bien 🙂', 'Très bien 😊', 'Super ! 🤩', 'Extraordinaire ! 🎉'];

  return (
    <div className="text-center">
      <div className="flex justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-125 active:scale-95"
          >
            <span className={`text-3xl ${(hover || rating) >= star ? 'opacity-100' : 'opacity-30'}`}>
              ⭐
            </span>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-sm font-bold text-amber-700 animate-fade-in-up">
          {labels[rating]}
        </p>
      )}
    </div>
  );
}
