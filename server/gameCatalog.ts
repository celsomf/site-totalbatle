import { timingSafeEqual } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { EnemySquadUnit } from '../src/types';
import type { CatalogTargetLevel, GameCatalogData } from '../src/types/catalog';

type Queryable = Pick<PoolClient, 'query'>;

export async function getGameCatalog(db: Queryable): Promise<GameCatalogData> {
  const troopsResult = await db.query(
      `SELECT id, name, category, tier, troop_class AS "troopClass", base_attack AS "baseAttack",
        base_health AS "baseHealth", revival_silver_cost AS "revivalSilverCost",
        revival_gold_cost AS "revivalGoldCost", leadership_cost AS "leadershipCost", speed,
        capacity, food_consumption AS "foodConsumption", aspects, avatar_icon AS "avatarIcon",
        avatar_path AS "avatarPath"
       FROM troop_catalog ORDER BY category, tier, name`
    );
  const monstersResult = await db.query(
      `SELECT id, name, tier, family, sub_type AS "subType", troop_class AS "troopClass",
        unit_attack AS "unitAttack", unit_health AS "unitHealth", leadership, initiative,
        aspects, aliases, avatar_path AS "avatarPath", detail_image_path AS "detailImagePath",
        is_enemy AS "isEnemy", unit_type AS "unitType"
       FROM monster_units ORDER BY family, tier, name, id`
    );
  const templatesResult = await db.query(
      `SELECT id, name, faction, watchtower_family_id AS "watchtowerFamilyId",
        watchtower_family_name AS "watchtowerFamilyName", watchtower_avatar_unit_id AS "watchtowerAvatarUnitId",
        attack_mode AS "attackMode", target_type AS "targetType", default_level AS "defaultLevel",
        available_levels AS "availableLevels", description
       FROM monster_target_templates ORDER BY watchtower_family_name, attack_mode, name`
    );
  const levelsResult = await db.query(
      `SELECT id, template_id AS "templateId", level, xp_reward AS "xpReward",
        valor_reward AS "valorReward", tar_reward AS "tarReward", chest_reward AS "chestReward",
        guards_capacity AS "guardsCapacity", mercenaries_capacity AS "mercenariesCapacity",
        monsters_capacity AS "monstersCapacity"
       FROM monster_target_levels ORDER BY template_id, level`
    );
  const formationsResult = await db.query(
      `SELECT f.target_level_id AS "targetLevelId", f.monster_unit_id AS "monsterUnitId",
        f.quantity, f.position, m.name, m.tier, m.family, m.sub_type AS "subType",
        m.troop_class AS "troopClass", m.unit_attack AS "unitAttack", m.unit_health AS "unitHealth",
        m.leadership, m.initiative, m.aspects, m.avatar_path AS "avatarPath"
       FROM monster_formation_units f
       JOIN monster_units m ON m.id = f.monster_unit_id
       ORDER BY f.target_level_id, f.position, m.name`
    );

  const squadsByTarget = new Map<string, EnemySquadUnit[]>();
  for (const row of formationsResult.rows) {
    const squads = squadsByTarget.get(row.targetLevelId) || [];
    squads.push({
      id: row.monsterUnitId,
      name: row.name,
      tier: row.tier,
      troopClass: row.troopClass,
      family: row.family as EnemySquadUnit['family'],
      subType: row.subType,
      unitAttack: row.unitAttack,
      unitHealth: row.unitHealth,
      leadership: row.leadership,
      initiative: row.initiative,
      count: row.quantity,
      aspects: row.aspects || {},
      isEnemy: true,
      unitType: 'enemy_monster',
      avatarUrl: row.avatarPath || undefined,
    });
    squadsByTarget.set(row.targetLevelId, squads);
  }

  const levelsByTemplate = new Map<string, CatalogTargetLevel[]>();
  for (const row of levelsResult.rows) {
    const levels = levelsByTemplate.get(row.templateId) || [];
    levels.push({
      id: row.id,
      level: row.level,
      xpReward: row.xpReward,
      valorReward: row.valorReward,
      tarReward: row.tarReward ?? undefined,
      chestReward: row.chestReward ?? undefined,
      marchCapacities: {
        guards: row.guardsCapacity,
        mercenaries: row.mercenariesCapacity,
        monsters: row.monstersCapacity,
      },
      squads: squadsByTarget.get(row.id) || [],
    });
    levelsByTemplate.set(row.templateId, levels);
  }

  return {
    troops: troopsResult.rows.map((row) => ({
      ...row,
      ownedCount: 0,
      isUnlocked: true,
      aspects: row.aspects || {},
    })),
    monsters: monstersResult.rows.map((row) => ({
      ...row,
      family: row.family as GameCatalogData['monsters'][number]['family'],
      aliases: Array.isArray(row.aliases) ? row.aliases : [],
      aspects: row.aspects || {},
    })),
    templates: templatesResult.rows.map((row) => ({
      ...row,
      availableLevels: row.availableLevels || [],
      levels: levelsByTemplate.get(row.id) || [],
    })),
  };
}

export interface FormationUnitInput {
  monsterUnitId: string;
  quantity: number;
}

export async function replaceFormation(
  client: PoolClient,
  targetLevelId: string,
  units: FormationUnitInput[]
): Promise<void> {
  const target = await client.query('SELECT id FROM monster_target_levels WHERE id = $1', [targetLevelId]);
  if (target.rowCount !== 1) throw new Error('Nível de alvo não encontrado no catálogo.');

  const uniqueUnits = new Set<string>();
  for (const unit of units) {
    if (!unit.monsterUnitId || !Number.isSafeInteger(unit.quantity) || unit.quantity <= 0) {
      throw new Error('Cada unidade precisa de um monstro do catálogo e uma quantidade inteira maior que zero.');
    }
    if (uniqueUnits.has(unit.monsterUnitId)) throw new Error('A formação contém o mesmo monstro mais de uma vez.');
    uniqueUnits.add(unit.monsterUnitId);
  }
  if (units.length > 20) throw new Error('Uma formação pode conter no máximo 20 tipos de monstros.');

  if (units.length > 0) {
    const ids = units.map((unit) => unit.monsterUnitId);
    const found = await client.query('SELECT id FROM monster_units WHERE id = ANY($1::varchar[])', [ids]);
    if (found.rowCount !== ids.length) throw new Error('Um ou mais monstros não existem no catálogo do banco.');
  }

  await client.query('DELETE FROM monster_formation_units WHERE target_level_id = $1', [targetLevelId]);
  for (const [position, unit] of units.entries()) {
    await client.query(
      `INSERT INTO monster_formation_units (target_level_id, monster_unit_id, quantity, position)
       VALUES ($1, $2, $3, $4)`,
      [targetLevelId, unit.monsterUnitId, unit.quantity, position]
    );
  }
}

function legacyCatalogId(squad: Record<string, any>): string | null {
  const id = typeof squad.id === 'string' ? squad.id : '';
  const timestampSuffix = id.match(/^(.*)_\d{10,}_\d+$/);
  return timestampSuffix?.[1] || (id || null);
}

async function resolveLegacyMonster(client: PoolClient, squad: Record<string, any>): Promise<string | null> {
  const legacyId = legacyCatalogId(squad);
  if (legacyId) {
    const byId = await client.query('SELECT id FROM monster_units WHERE id = $1', [legacyId]);
    if (byId.rowCount === 1) return byId.rows[0].id;
  }

  const byIdentity = await client.query(
    `SELECT id FROM monster_units
     WHERE LOWER(name) = LOWER($1) AND tier = $2 AND troop_class = $3 AND family = $4
     ORDER BY id LIMIT 2`,
    [squad.name, squad.tier, squad.troopClass, squad.family]
  );
  return byIdentity.rowCount === 1 ? byIdentity.rows[0].id : null;
}

export interface LegacyFormationImport {
  targetId: string;
  variants: Array<{ id?: string; name?: string; squads?: Record<string, any>[] }>;
  activeVariantId?: string;
}

export async function importLegacyFormations(
  client: PoolClient,
  sourceKey: string,
  payload: unknown
): Promise<{ imported: number; skipped: number; alreadyImported: boolean; unresolved: string[] }> {
  if (!/^[a-zA-Z0-9_-]{8,90}$/.test(sourceKey)) throw new Error('Identificador de origem inválido.');
  const entries = Array.isArray((payload as any)?.entries) ? (payload as any).entries as LegacyFormationImport[] : [];
  if (entries.length > 1000) throw new Error('A importação excede o limite de formações permitido.');

  const previous = await client.query('SELECT import_id FROM legacy_monster_imports WHERE source_key = $1', [sourceKey]);
  if (previous.rowCount) return { imported: 0, skipped: 0, alreadyImported: true, unresolved: [] };

  let imported = 0;
  let skipped = 0;
  const unresolved: string[] = [];

  for (const entry of entries) {
    if (typeof entry.targetId !== 'string' || !Array.isArray(entry.variants)) {
      skipped++;
      continue;
    }

    const active = entry.variants.find((variant) => variant.id === entry.activeVariantId) || entry.variants[0];
    if (!active || !Array.isArray(active.squads) || active.squads.length === 0) {
      skipped++;
      continue;
    }

    const target = await client.query('SELECT id FROM monster_target_levels WHERE id = $1', [entry.targetId]);
    if (target.rowCount !== 1) {
      skipped++;
      unresolved.push(entry.targetId);
      continue;
    }
    const existing = await client.query(
      'SELECT 1 FROM monster_formation_units WHERE target_level_id = $1 LIMIT 1',
      [entry.targetId]
    );
    if (existing.rowCount) {
      skipped++;
      continue;
    }

    const resolvedUnits: FormationUnitInput[] = [];
    let canImport = true;
    for (const squad of active.squads) {
      const monsterUnitId = await resolveLegacyMonster(client, squad);
      const quantity = Number(squad.count);
      if (!monsterUnitId || !Number.isSafeInteger(quantity) || quantity <= 0) {
        canImport = false;
        unresolved.push(`${entry.targetId}: ${String(squad.name || squad.id || 'monstro sem nome')}`);
        break;
      }
      const existingUnit = resolvedUnits.find((unit) => unit.monsterUnitId === monsterUnitId);
      if (existingUnit) existingUnit.quantity += quantity;
      else resolvedUnits.push({ monsterUnitId, quantity });
    }

    if (!canImport) {
      skipped++;
      continue;
    }

    await replaceFormation(client, entry.targetId, resolvedUnits);
    imported++;
  }

  await client.query(
    `INSERT INTO legacy_monster_imports (import_id, source_key, payload, imported_count, skipped_count)
     VALUES ($1, $2, $3::jsonb, $4, $5)`,
    [`legacy_${sourceKey}`, sourceKey, JSON.stringify(payload), imported, skipped]
  );

  return { imported, skipped, alreadyImported: false, unresolved };
}

export function isCatalogWriteAuthorized(authorizationHeader?: string): boolean {
  const expected = process.env.CATALOG_WRITE_TOKEN;
  if (!expected) return process.env.NODE_ENV !== 'production';
  const supplied = authorizationHeader?.replace(/^Bearer\s+/i, '') || '';
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}
