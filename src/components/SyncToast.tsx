import { useState, useEffect, useCallback } from 'react';
import { useEvent } from '../context/EventContext';
import { Copy, Check, Share2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION : Rappelle de partager après chaque modif
// ═══════════════════════════════════════════════════════════════

let lastConfigJson = '';
let showCallback: ((show: boolean) => void) | null = null;

// Appelé par EventContext quand la config change
export function notifyConfigChanged() {
  if (showCallback) showCallback(true);
}

export default function SyncToast() {
  const { isOrganizer, shareableUrl } = useEvent();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    showCallback = setVisible;
    return () => { showCallback = null; };
  }, []);

  // Détecter les changements de config
  useEffect(() => {
    if (!isOrganizer) return;
    const currentJson = shareableUrl;
    if (lastConfigJson && lastConfigJson !== currentJson) {
      setVisible(true);
    }
    lastConfigJson = currentJson;
  }, [shareableUrl, isOrganizer]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setVisible(false); }, 2000);
    } catch {
      prompt('Copiez ce lien :', shareableUrl);
    }
  }, [shareableUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Livret mis à jour', text: 'Voici le lien mis à jour du livret interactif !', url: shareableUrl });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  }, [shareableUrl, handleCopy]);

  if (!visible || !isOrganizer) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-[150] animate-fade-in-up" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="rounded-2xl p-3 shadow-2xl flex items-center gap-3"
        style={{ backgroundColor: '#FFF3E0', border: '2px solid #FFB74D' }}>
        <span className="text-xl flex-shrink-0">🔗</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black" style={{ color: '#E65100' }}>Paramètres modifiés !</p>
          <p className="text-[10px] leading-snug" style={{ color: '#6B5A5A' }}>
            Re-partagez le lien pour que les participants voient les changements.
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={handleCopy}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            style={{
              backgroundColor: copied ? 'var(--color-forest-500)' : 'white',
              color: copied ? 'white' : 'var(--color-forest-700)',
              border: `1px solid ${copied ? 'var(--color-forest-500)' : 'var(--color-forest-200)'}`,
            }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button onClick={handleShare}
              className="px-3 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-forest-500)' }}>
              <Share2 size={13} />
            </button>
          )}
        </div>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold flex-shrink-0">✕</button>
      </div>
    </div>
  );
}
