import { PlayerProfile, ProfileSummary } from '../types';
import type { GameCatalogData } from '../types/catalog';
import type { EnemySquadUnit } from '../types';

const API_BASE = typeof window !== 'undefined' ? '/api' : 'http://localhost:3001/api';
const CATALOG_WRITE_TOKEN_KEY = 'total_battle_catalog_write_token_v1';

async function catalogWrite<T>(payload: unknown): Promise<T> {
  const send = async (token?: string) => fetch(`${API_BASE}/monster-formations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  let token: string | undefined;
  try { token = sessionStorage.getItem(CATALOG_WRITE_TOKEN_KEY) || undefined; } catch { /* storage unavailable */ }
  let response = await send(token);

  if (response.status === 401 && typeof window !== 'undefined') {
    const supplied = window.prompt('Informe a chave de edição configurada no servidor para salvar formações compartilhadas:');
    if (!supplied) throw new Error('Edição cancelada. A formação ainda não foi salva.');
    token = supplied.trim();
    response = await send(token);
    if (response.ok) {
      try { sessionStorage.setItem(CATALOG_WRITE_TOKEN_KEY, token); } catch { /* storage unavailable */ }
    } else if (response.status === 401) {
      try { sessionStorage.removeItem(CATALOG_WRITE_TOKEN_KEY); } catch { /* storage unavailable */ }
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Falha ao salvar no banco (HTTP ${response.status}).`);
  return data as T;
}

export async function fetchGameCatalogFromDb(): Promise<GameCatalogData> {
  const res = await fetch(`${API_BASE}/catalog`, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Falha ao carregar catálogo do banco (HTTP ${res.status}).`);
  }
  return await res.json() as GameCatalogData;
}

export async function saveMonsterFormationToDb(
  targetId: string,
  squads: EnemySquadUnit[]
): Promise<void> {
  await catalogWrite({
    action: 'save',
    targetId,
    units: squads.map((squad) => ({ monsterUnitId: squad.id, quantity: squad.count })),
  });
}

export async function copyMonsterFormationInDb(
  sourceTargetId: string,
  destinationTargetIds: string[]
): Promise<number> {
  const result = await catalogWrite<{ copiedTo: number }>({ action: 'copy', sourceTargetId, destinationTargetIds });
  return result.copiedTo;
}

export async function importLegacyMonsterFormationsToDb(sourceKey: string, payload: unknown) {
  return catalogWrite<{
    imported: number;
    skipped: number;
    alreadyImported: boolean;
    unresolved: string[];
  }>({ action: 'import-legacy', sourceKey, payload });
}

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
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CATALOG_WRITE_TOKEN_KEY) : null;
    const res = await fetch(`${API_BASE}/monsters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CATALOG_WRITE_TOKEN_KEY) : null;
    const res = await fetch(`${API_BASE}/monsters/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
