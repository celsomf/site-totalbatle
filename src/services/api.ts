import { PlayerProfile } from '../types';

const API_BASE = 'http://localhost:3001/api';

export interface HealthResponse {
  status: 'ok' | 'offline';
  db: 'connected' | 'disconnected';
  time?: string;
  error?: string;
}

export async function checkDbHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return { status: 'offline', db: 'disconnected', error: e.message };
  }
}

export async function fetchProfileFromDb(): Promise<PlayerProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile`, { credentials: 'omit', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.profile || null;
  } catch (e: any) {
    console.warn('[API Client] Não foi possível carregar do PostgreSQL:', e.message);
    return null;
  }
}

export async function saveProfileToDb(profile: PlayerProfile): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (e: any) {
    console.warn('[API Client] Erro ao salvar no PostgreSQL (mantido no LocalStorage):', e.message);
    return false;
  }
}
