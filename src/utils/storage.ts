// ═══════════════════════════════════════════════════════════════
// 💾 STOCKAGE SÉCURISÉ
// Fonctionne même quand localStorage n'est pas disponible
// (fichier HTML ouvert directement avec file://, mode privé, etc.)
// ═══════════════════════════════════════════════════════════════

let storageAvailable: boolean | null = null;
const memoryStore = new Map<string, string>();

function checkStorage(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

export function safeGet(key: string): string | null {
  if (checkStorage()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return memoryStore.get(key) ?? null;
}

export function safeSet(key: string, value: string): void {
  // Always save to memory store as fallback
  memoryStore.set(key, value);
  if (checkStorage()) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage full or blocked — memory store is the fallback
    }
  }
}

export function safeRemove(key: string): void {
  memoryStore.delete(key);
  if (checkStorage()) {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  }
}

export function safeClear(): void {
  memoryStore.clear();
  if (checkStorage()) {
    try {
      localStorage.clear();
    } catch { /* ignore */ }
  }
}
