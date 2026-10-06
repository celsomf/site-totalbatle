import type { Pool, PoolClient } from 'pg';
import { getGameCatalog, importLegacyFormations, replaceFormation } from './gameCatalog';

type FormationMutation =
  | { action: 'save'; targetId: string; units: Array<{ monsterUnitId?: string; id?: string; quantity?: number; count?: number }> }
  | { action: 'copy'; sourceTargetId: string; destinationTargetIds: string[] }
  | { action: 'import-legacy'; sourceKey: string; payload: unknown };

export async function readCatalog(pool: Pool) {
  const client = await pool.connect();
  try {
    return await getGameCatalog(client);
  } finally {
    client.release();
  }
}

export async function mutateCatalogFormations(pool: Pool, payload: unknown) {
  const input = payload as Partial<FormationMutation> | null;
  if (!input || typeof input !== 'object') throw new Error('Corpo da solicitação inválido.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (input.action === 'save') {
      const body = input as Extract<FormationMutation, { action: 'save' }>;
      if (typeof body.targetId !== 'string' || !Array.isArray(body.units)) {
        throw new Error('Informe o alvo e a lista de monstros da formação.');
      }
      const units = body.units.map((unit) => ({
        monsterUnitId: String(unit.monsterUnitId || unit.id || ''),
        quantity: Number(unit.quantity ?? unit.count),
      }));
      await replaceFormation(client, body.targetId, units);
      await client.query('COMMIT');
      return { success: true, action: 'save' as const };
    }

    if (input.action === 'copy') {
      const body = input as Extract<FormationMutation, { action: 'copy' }>;
      if (
        typeof body.sourceTargetId !== 'string' ||
        !Array.isArray(body.destinationTargetIds) ||
        body.destinationTargetIds.length === 0 ||
        body.destinationTargetIds.length > 45
      ) {
        throw new Error('Informe o nível de origem e ao menos um nível de destino.');
      }
      const source = await client.query(
        `SELECT tl.template_id AS "templateId", f.monster_unit_id AS "monsterUnitId", f.quantity
         FROM monster_target_levels tl
         LEFT JOIN monster_formation_units f ON f.target_level_id = tl.id
         WHERE tl.id = $1 ORDER BY f.position`,
        [body.sourceTargetId]
      );
      if (source.rowCount === 0) throw new Error('Nível de origem não encontrado.');
      const templateId = source.rows[0].templateId;
      const units = source.rows
        .filter((row) => row.monsterUnitId)
        .map((row) => ({ monsterUnitId: row.monsterUnitId as string, quantity: Number(row.quantity) }));
      const destinations = Array.from(new Set(body.destinationTargetIds));
      if (destinations.includes(body.sourceTargetId)) throw new Error('O nível de origem não pode ser destino.');
      const validTargets = await client.query(
        'SELECT id FROM monster_target_levels WHERE template_id = $1 AND id = ANY($2::varchar[])',
        [templateId, destinations]
      );
      if (validTargets.rowCount !== destinations.length) {
        throw new Error('Todos os níveis de destino precisam pertencer à mesma família de alvos.');
      }
      for (const destinationId of destinations) {
        await replaceFormation(client, destinationId, units);
      }
      await client.query('COMMIT');
      return { success: true, action: 'copy' as const, copiedTo: destinations.length };
    }

    if (input.action === 'import-legacy') {
      const body = input as Extract<FormationMutation, { action: 'import-legacy' }>;
      if (typeof body.sourceKey !== 'string') throw new Error('Informe a origem da migração local.');
      const result = await importLegacyFormations(client, body.sourceKey, body.payload);
      await client.query('COMMIT');
      return { success: true, action: 'import-legacy' as const, ...result };
    }

    throw new Error('Ação de formação não reconhecida.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function runSchemaIfNeeded(initDatabase: () => Promise<boolean>) {
  const initialized = await initDatabase();
  if (!initialized) throw new Error('Não foi possível conectar ou preparar o banco de dados.');
}
