import { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { X, Lock } from 'lucide-react';

interface PinModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinModal({ onSuccess, onCancel }: PinModalProps) {
  const { unlockOrganizer } = useEvent();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (unlockOrganizer(pin)) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl p-6 w-[320px] shadow-2xl animate-fade-in-up ${shake ? 'animate-[shake_0.5s]' : ''}`}>
        <button onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-400" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-forest-50)' }}>
            <Lock size={24} style={{ color: 'var(--color-forest-600)' }} />
          </div>
          <h3 className="font-black text-base" style={{ color: '#6B5A5A' }}>
            Accès organisateur
          </h3>
          <p className="text-[11px] mt-1" style={{ color: '#6B5A5A', opacity: 0.6 }}>
            Saisissez le code à 4 chiffres pour accéder aux paramètres
          </p>
        </div>

        {/* PIN Input */}
        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i}
              className="w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all"
              style={{
                borderColor: pin.length > i ? 'var(--color-forest-400)' : error ? '#ef4444' : '#E8CFCB',
                backgroundColor: pin.length > i ? 'var(--color-forest-50)' : '#F4F4F4',
                color: 'var(--color-forest-700)',
              }}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n}
              onClick={() => pin.length < 4 && setPin(prev => prev + n)}
              className="py-3 rounded-xl font-bold text-lg transition-all active:scale-95"
              style={{ backgroundColor: '#F4F4F4', color: '#6B5A5A' }}>
              {n}
            </button>
          ))}
          <div /> {/* empty */}
          <button onClick={() => pin.length < 4 && setPin(prev => prev + '0')}
            className="py-3 rounded-xl font-bold text-lg transition-all active:scale-95"
            style={{ backgroundColor: '#F4F4F4', color: '#6B5A5A' }}>
            0
          </button>
          <button onClick={() => setPin(prev => prev.slice(0, -1))}
            className="py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ backgroundColor: '#F4F4F4', color: '#6B5A5A' }}>
            ←
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-bold text-center mb-2 animate-fade-in-up">
            ❌ Code incorrect. Réessayez.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={pin.length < 4}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30"
          style={{ backgroundColor: 'var(--color-forest-500)' }}>
          Valider
        </button>
      </div>
    </div>
  );
}
