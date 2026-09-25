import { PlayerProfile, ProfileSummary } from '../types';

const API_BASE = typeof window !== 'undefined' ? '/api' : 'http://localhost:3001/api';

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

export async function fetchProfilesListFromDb(): Promise<ProfileSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/profiles`, { credentials: 'omit', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.profiles || [];
  } catch (e: any) {
    console.warn('[API Client] Não foi possível listar perfis do PostgreSQL:', e.message);
    return [];
  }
}

export async function fetchProfileFromDb(profileId?: string): Promise<PlayerProfile | null> {
  try {
    const endpoint = profileId ? `${API_BASE}/profile/${encodeURIComponent(profileId)}` : `${API_BASE}/profile`;
    const res = await fetch(endpoint, { credentials: 'omit', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.profile || null;
  } catch (e: any) {
    console.warn(`[API Client] Não foi possível carregar perfil '${profileId || 'default'}' do PostgreSQL:`, e.message);
    return null;
  }
}

export async function saveProfileToDb(profile: PlayerProfile, profileId?: string): Promise<boolean> {
  try {
    const targetId = profileId || profile.id || 'main_profile';
    const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(targetId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, id: targetId }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (e: any) {
    console.warn('[API Client] Erro ao salvar no PostgreSQL (mantido no LocalStorage):', e.message);
    return false;
  }
}

export async function deleteProfileFromDb(profileId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(profileId)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (e: any) {
    console.warn(`[API Client] Erro ao excluir perfil '${profileId}' do PostgreSQL:`, e.message);
    return false;
  }
}

export async function fetchMonsterUnitsFromDb(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/monsters`, { credentials: 'omit', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.monsters || [];
  } catch (e: any) {
    console.warn('[API Client] Não foi possível carregar monstros do PostgreSQL:', e.message);
    return null;
  }
}

export async function saveMonsterUnitToDb(monster: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/monsters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monster),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (e: any) {
    console.warn('[API Client] Erro ao salvar monstro no PostgreSQL:', e.message);
    return false;
  }
}

export async function saveMonsterUnitsBulkToDb(monsters: any[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/monsters/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monsters }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (e: any) {
    console.warn('[API Client] Erro ao salvar lote de monstros no PostgreSQL:', e.message);
    return false;
  }
}
