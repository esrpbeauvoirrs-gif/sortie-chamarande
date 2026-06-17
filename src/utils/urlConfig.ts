// ═══════════════════════════════════════════════════════════════
// 🔗 CONFIG DANS L'URL
// L'organisateur configure → l'URL contient toute la config
// Il partage le lien → les participants voient les mêmes paramètres
// Pas besoin de serveur !
// ═══════════════════════════════════════════════════════════════

import { EventConfig, DEFAULT_CONFIG } from '../context/EventContext';

const CONFIG_KEY = 'c';

/**
 * Encode la config en chaîne URL-safe (base64)
 */
export function encodeConfigToUrl(config: EventConfig): string {
  try {
    const json = JSON.stringify(config);
    // Encode en base64 URL-safe
    const base64 = btoa(unescape(encodeURIComponent(json)));
    const url = new URL(window.location.href.split('?')[0].split('#')[0]);
    url.searchParams.set(CONFIG_KEY, base64);
    return url.toString();
  } catch {
    return window.location.href;
  }
}

/**
 * Décode la config depuis l'URL courante
 * Retourne null si aucune config n'est dans l'URL
 */
export function decodeConfigFromUrl(): EventConfig | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(CONFIG_KEY);
    if (!encoded) return null;

    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);
    if (parsed && parsed.eventDate) {
      // Merge avec les défauts pour les champs manquants
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Vérifie si l'URL contient une config
 */
export function urlHasConfig(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has(CONFIG_KEY);
  } catch {
    return false;
  }
}

/**
 * Met à jour l'URL du navigateur avec la config (sans recharger)
 */
export function updateBrowserUrl(config: EventConfig): string {
  const newUrl = encodeConfigToUrl(config);
  try {
    window.history.replaceState(null, '', newUrl);
  } catch { /* ignore */ }
  return newUrl;
}
