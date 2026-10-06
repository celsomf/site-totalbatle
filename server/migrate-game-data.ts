import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_TROOPS } from '../src/data/troops';
import {
  MONSTER_PRESET_TEMPLATES,
  MONSTER_UNITS_CATALOG,
  buildMonsterTargetFromTemplate,
} from '../src/data/monsters';
import { REAL_TROOP_IMAGES } from '../src/data/troopAvatarPaths';
import { MONSTER_CATALOG_SEED, type MonsterCatalogSeed } from './monster-catalog-seed';
import { pool, initDatabase } from './db';

type AssetRecord = { avatar?: string; detail?: string };
const DUPLICATE_MONSTER_IDS = [
  { duplicateId: 'cavalgante_cao_morte', canonicalId: 'cavalgante_de_cao_da_morte' },
  { duplicateId: 'cavalgante_trevas', canonicalId: 'cavalgante_das_trevas' },
] as const;

const WATCHTOWER_GROUP_BY_FACTION: Record<string, { id: string; name: string; avatarId: string }> = {
  barbarian: { id: 'barbarians', name: 'Bárbaros', avatarId: 'ogro_xama' },
  inferno: { id: 'inferno', name: 'Inferno', avatarId: 'demonio_com_chifres' },
  undead: { id: 'undead', name: 'Mortos-Vivos', avatarId: 'esqueleto' },
  elfos: { id: 'elves', name: 'Elfos', avatarId: 'arqueiro_elfico' },
  elemental: { id: 'elves', name: 'Elfos', avatarId: 'arqueiro_elfico' },
  cursed: { id: 'cursed', name: 'Amaldiçoados', avatarId: 'licantropo' },
  epic: { id: 'others', name: 'Outros / Épicos', avatarId: 'dragao_da_vida' },
  dragons: { id: 'others', name: 'Outros / Épicos', avatarId: 'dragao_da_vida' },
};

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function listAssets(folder: string): Promise<Map<string, string>> {
  const directory = path.resolve(process.cwd(), 'public', 'assets', folder);
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  return new Map(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => [normalize(path.parse(entry.name).name), entry.name])
  );
}

function findTroopAvatarPath(
  id: string,
  avatarIcon: string | undefined,
  troopAssets: Map<string, string>,
  monsterAssets: Map<string, string>
): string | undefined {
  const mappedPath = [avatarIcon, id]
    .map((key) => key ? REAL_TROOP_IMAGES[key] || REAL_TROOP_IMAGES[key.toLowerCase()] : undefined)
    .find(Boolean);

  if (mappedPath) {
    const folder = mappedPath.startsWith('/assets/monsters/') ? 'monsters' : 'troops';
    const assets = folder === 'monsters' ? monsterAssets : troopAssets;
    const actualFile = assets.get(normalize(path.parse(mappedPath).name));
    if (actualFile) return `/assets/${folder}/${actualFile}`;
  }

  return findImagePaths([id, avatarIcon || ''], troopAssets, 'troops').avatar;
}

function findImagePaths(
  candidates: string[],
  assets: Map<string, string>,
  folder: string,
  avatarRequiresSuffix = false
): AssetRecord {
  const stems = candidates.map(normalize).filter(Boolean);
  const find = (wanted: string[]) => {
    for (const stem of wanted) {
      const match = assets.get(normalize(stem));
      if (match) return `/assets/${folder}/${match}`;
    }
    return undefined;
  };

  const avatarCandidates = stems.flatMap((stem) =>
    avatarRequiresSuffix ? [`${stem}_avatar`] : [`${stem}_avatar`, stem]
  );
  const avatar = find(avatarCandidates);
  const detail = find(stems);
  return {
    avatar,
    detail: detail && detail !== avatar ? detail : undefined,
  };
}

async function mergeDuplicateMonsterCatalogRows(client: import('pg').PoolClient): Promise<number> {
  let merged = 0;
  for (const { duplicateId, canonicalId } of DUPLICATE_MONSTER_IDS) {
    const duplicate = await client.query(
      `SELECT canonical.aliases AS "canonicalAliases",
              ROW(canonical.name, canonical.tier, canonical.family, canonical.sub_type,
                  canonical.troop_class, canonical.unit_attack, canonical.unit_health,
                  canonical.leadership, canonical.initiative, canonical.aspects,
                  canonical.avatar_path, canonical.detail_image_path,
                  canonical.is_enemy, canonical.unit_type)
                IS NOT DISTINCT FROM
              ROW(legacy.name, legacy.tier, legacy.family, legacy.sub_type,
                  legacy.troop_class, legacy.unit_attack, legacy.unit_health,
                  legacy.leadership, legacy.initiative, legacy.aspects,
                  legacy.avatar_path, legacy.detail_image_path,
                  legacy.is_enemy, legacy.unit_type) AS "sameRecord"
       FROM monster_units canonical
       JOIN monster_units legacy ON legacy.id = $2
       WHERE canonical.id = $1`,
      [canonicalId, duplicateId]
    );
    if (duplicate.rowCount === 0) continue;
    if (!duplicate.rows[0].sameRecord) {
      throw new Error(`O monstro duplicado ${duplicateId} diverge de ${canonicalId}; revisão manual necessária.`);
    }

    const oldFormations = await client.query(
      `SELECT target_level_id AS "targetLevelId", quantity, position
       FROM monster_formation_units WHERE monster_unit_id = $1`,
      [duplicateId]
    );
    for (const formation of oldFormations.rows) {
      await client.query(
        `INSERT INTO monster_formation_units (target_level_id, monster_unit_id, quantity, position)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (target_level_id, monster_unit_id) DO UPDATE
           SET quantity = monster_formation_units.quantity + EXCLUDED.quantity,
               position = LEAST(monster_formation_units.position, EXCLUDED.position)`,
        [formation.targetLevelId, canonicalId, formation.quantity, formation.position]
      );
    }

    const aliases = Array.isArray(duplicate.rows[0].canonicalAliases)
      ? duplicate.rows[0].canonicalAliases as string[]
      : [];
    if (!aliases.includes(duplicateId)) aliases.push(duplicateId);
    await client.query('UPDATE monster_units SET aliases = $2::jsonb, updated_at = NOW() WHERE id = $1', [
      canonicalId,
      JSON.stringify(aliases),
    ]);
    await client.query('DELETE FROM monster_formation_units WHERE monster_unit_id = $1', [duplicateId]);
    await client.query('DELETE FROM monster_units WHERE id = $1', [duplicateId]);
    merged++;
  }
  return merged;
}

async function migrate() {
  if (!(await initDatabase())) {
    throw new Error('Não foi possível inicializar o PostgreSQL.');
  }

  const monsterAssets = await listAssets('monsters');
  const troopAssets = await listAssets('troops');
  const client = await pool.connect();
  let insertedTroops = 0;
  let insertedMonsters = 0;
  let insertedTemplates = 0;
  let insertedLevels = 0;

  try {
    await client.query('BEGIN');

    const monsterSeedById = new Map<string, MonsterCatalogSeed>(
      MONSTER_CATALOG_SEED.map((monster) => [monster.id, monster])
    );
    // Mantém novos registros do catálogo de migração enquanto a cópia completa do banco
    // legado serve como base reproduzível para instalações novas.
    for (const monster of MONSTER_UNITS_CATALOG) {
      if (!monsterSeedById.has(monster.id)) monsterSeedById.set(monster.id, monster);
    }

    const monstersToSeed = Array.from(monsterSeedById.values());

    for (const troop of DEFAULT_TROOPS) {
      const avatar = findTroopAvatarPath(troop.id, troop.avatarIcon, troopAssets, monsterAssets)
        || findImagePaths([troop.id, troop.avatarIcon || '', troop.name], troopAssets, 'troops').avatar;
      const result = await client.query(
        `INSERT INTO troop_catalog (
          id, name, category, tier, troop_class, base_attack, base_health,
          revival_silver_cost, revival_gold_cost, leadership_cost, speed, capacity,
          food_consumption, aspects, avatar_icon, avatar_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING`,
        [
          troop.id,
          troop.name,
          troop.category,
          troop.tier,
          troop.troopClass,
          troop.baseAttack,
          troop.baseHealth,
          troop.revivalSilverCost,
          troop.revivalGoldCost ?? null,
          troop.leadershipCost,
          troop.speed ?? null,
          troop.capacity ?? null,
          troop.foodConsumption ?? null,
          JSON.stringify(troop.aspects || {}),
          troop.avatarIcon || null,
          avatar || null,
        ]
      );
      insertedTroops += result.rowCount || 0;
      await client.query(
        'UPDATE troop_catalog SET avatar_path = COALESCE(avatar_path, $2) WHERE id = $1',
        [troop.id, avatar || null]
      );
    }

    for (const monster of monstersToSeed) {
      const paths = findImagePaths(
        [monster.id, monster.name, ...(monster.aliases || [])],
        monsterAssets,
        'monsters',
        true
      );
      const result = await client.query(
        `INSERT INTO monster_units (
          id, name, tier, family, sub_type, troop_class, unit_attack, unit_health,
          leadership, initiative, aspects, aliases, avatar_path, detail_image_path,
          is_enemy, unit_type, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        ON CONFLICT (id) DO NOTHING`,
        [
          monster.id,
          monster.name,
          monster.tier,
          monster.family,
          monster.subType,
          monster.troopClass,
          monster.unitAttack,
          monster.unitHealth,
          monster.leadership,
          monster.initiative,
          JSON.stringify(monster.aspects || {}),
          JSON.stringify(monster.aliases || []),
          monster.avatarPath || paths.avatar || null,
          monster.detailImagePath || paths.detail || null,
          monster.isEnemy ?? true,
          monster.unitType || 'enemy_monster',
        ]
      );
      insertedMonsters += result.rowCount || 0;
    }

    const mergedDuplicateMonsters = await mergeDuplicateMonsterCatalogRows(client);

    // Preenche caminhos de imagem ausentes também nos registros já existentes,
    // sem substituir valores que tenham sido cadastrados diretamente no banco.
    const currentMonsters = await client.query(
      `SELECT id, name, aliases, avatar_path AS "avatarPath" FROM monster_units
       WHERE avatar_path IS NULL OR detail_image_path IS NULL OR aliases = '[]'::jsonb`
    );
    const importedMonsterById = monsterSeedById;
    for (const monster of currentMonsters.rows) {
      const aliases = Array.isArray(monster.aliases) ? monster.aliases : [];
      const importedAliases = importedMonsterById.get(monster.id)?.aliases || [];
      const searchAliases = aliases.length > 0 ? aliases : importedAliases;
      const paths = findImagePaths([monster.id, monster.name, ...searchAliases], monsterAssets, 'monsters', true);
      const avatarIsActuallyDetail = !paths.avatar && !!paths.detail && monster.avatarPath === paths.detail;
      await client.query(
        `UPDATE monster_units
         SET avatar_path = CASE WHEN $5 THEN NULL ELSE COALESCE(avatar_path, $2) END,
             detail_image_path = COALESCE(detail_image_path, $3),
             aliases = CASE WHEN aliases = '[]'::jsonb THEN $4::jsonb ELSE aliases END
         WHERE id = $1`,
        [monster.id, paths.avatar || null, paths.detail || null, JSON.stringify(importedAliases), avatarIsActuallyDetail]
      );
    }

    for (const template of MONSTER_PRESET_TEMPLATES) {
      const group = WATCHTOWER_GROUP_BY_FACTION[template.faction] || {
        id: template.faction,
        name: template.faction,
        avatarId: monstersToSeed[0]?.id || '',
      };
      const levels = Array.from({ length: 45 }, (_, index) => index + 1);

      const templateResult = await client.query(
        `INSERT INTO monster_target_templates (
          id, name, faction, watchtower_family_id, watchtower_family_name, watchtower_avatar_unit_id,
          attack_mode, target_type, default_level, available_levels, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING`,
        [
          template.id,
          template.name,
          template.faction,
          group.id,
          group.name,
          group.avatarId,
          template.attackMode,
          template.targetType,
          template.defaultLevel,
          levels,
          template.description,
        ]
      );
      insertedTemplates += templateResult.rowCount || 0;

      for (const level of levels) {
        const target = buildMonsterTargetFromTemplate(template, level, true);
        const result = await client.query(
          `INSERT INTO monster_target_levels (
            id, template_id, level, xp_reward, valor_reward, tar_reward, chest_reward,
            guards_capacity, mercenaries_capacity, monsters_capacity
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING`,
          [
            target.id,
            template.id,
            level,
            target.xpReward || 0,
            target.valorReward || 0,
            target.tarReward ?? null,
            target.estimatedChestPoints || null,
            target.marchCapacities?.guards || 0,
            target.marchCapacities?.mercenaries || 0,
            target.marchCapacities?.monsters || 0,
          ]
        );
        insertedLevels += result.rowCount || 0;
      }
    }

    await client.query('COMMIT');

    const troopCount = await client.query('SELECT COUNT(*)::int AS count FROM troop_catalog');
    const monsterCount = await client.query('SELECT COUNT(*)::int AS count FROM monster_units');
    const templateCount = await client.query('SELECT COUNT(*)::int AS count FROM monster_target_templates');
    const levelCount = await client.query('SELECT COUNT(*)::int AS count FROM monster_target_levels');
    const imageCount = await client.query('SELECT COUNT(*)::int AS count FROM monster_units WHERE avatar_path IS NOT NULL');
    const detailImageCount = await client.query('SELECT COUNT(*)::int AS count FROM monster_units WHERE detail_image_path IS NOT NULL');
    const troopImageCount = await client.query('SELECT COUNT(*)::int AS count FROM troop_catalog WHERE avatar_path IS NOT NULL');

    console.log(
      JSON.stringify(
        {
          insertedTroops,
          totalTroops: troopCount.rows[0].count,
          troopsWithAvatar: troopImageCount.rows[0].count,
          insertedMonsters,
          mergedDuplicateMonsters,
          totalMonsters: monsterCount.rows[0].count,
          monsterSeedRecords: monstersToSeed.length,
          insertedTemplates,
          totalTemplates: templateCount.rows[0].count,
          insertedTargetLevels: insertedLevels,
          totalTargetLevels: levelCount.rows[0].count,
          monstersWithAvatar: imageCount.rows[0].count,
          monstersWithDetails: detailImageCount.rows[0].count,
          monsterImageFiles: monsterAssets.size,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('[Migração de catálogo] Falha. As gravações da transação foram revertidas.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
