import { pool, initDatabase } from './db';
import { MONSTER_UNITS_CATALOG } from '../src/data/monsters';

async function seedMonsters() {
  console.log('[Seed] Inicializando tabelas...');
  await initDatabase();

  const client = await pool.connect();
  try {
    console.log(`[Seed] Inserindo/atualizando ${MONSTER_UNITS_CATALOG.length} monstros no PostgreSQL...`);
    await client.query('BEGIN');

    for (const m of MONSTER_UNITS_CATALOG) {
      await client.query(
        `
        INSERT INTO monster_units (
          id, name, tier, family, sub_type, troop_class, unit_attack, unit_health, leadership, initiative, aspects, is_enemy, unit_type, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          tier = EXCLUDED.tier,
          family = EXCLUDED.family,
          sub_type = EXCLUDED.sub_type,
          troop_class = EXCLUDED.troop_class,
          unit_attack = EXCLUDED.unit_attack,
          unit_health = EXCLUDED.unit_health,
          leadership = EXCLUDED.leadership,
          initiative = EXCLUDED.initiative,
          aspects = EXCLUDED.aspects,
          is_enemy = EXCLUDED.is_enemy,
          unit_type = EXCLUDED.unit_type,
          updated_at = NOW();
        `,
        [
          m.id,
          m.name,
          m.tier,
          m.family,
          m.subType,
          m.troopClass,
          m.unitAttack,
          m.unitHealth,
          m.leadership,
          m.initiative,
          JSON.stringify(m.aspects || {}),
          m.isEnemy ?? true,
          m.unitType || 'enemy_monster',
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[Seed] Todos os monstros foram salvos com sucesso no PostgreSQL!');

    // Consulta de verificação
    const res = await client.query('SELECT id, name, tier, family, troop_class, unit_attack, unit_health, aspects FROM monster_units ORDER BY family, tier, name');
    console.log(`[Seed] Total de monstros no banco: ${res.rows.length}`);
    console.table(res.rows.map(r => ({
      id: r.id,
      name: r.name,
      family: r.family,
      tier: r.tier,
      class: r.troop_class,
      attack: r.unit_attack,
      health: r.unit_health,
      aspects: JSON.stringify(r.aspects),
    })));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Erro]:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedMonsters();
