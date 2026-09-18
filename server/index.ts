import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDatabase } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (err: any) {
    res.status(503).json({ status: 'offline', db: 'disconnected', error: err.message });
  }
});

// GET /api/profile
app.get('/api/profile', async (_req, res) => {
  try {
    const client = await pool.connect();
    
    // Perfil base
    const profileRes = await client.query(
      'SELECT * FROM player_profiles WHERE id = $1',
      ['main_profile']
    );

    if (profileRes.rows.length === 0) {
      client.release();
      return res.json({ profile: null });
    }

    const row = profileRes.rows[0];

    // Níveis de Capitães
    const captainsRes = await client.query(
      'SELECT captain_id, level FROM captain_levels WHERE profile_id = $1',
      ['main_profile']
    );
    const captainLevels: Record<string, number> = {};
    for (const c of captainsRes.rows) {
      captainLevels[c.captain_id] = c.level;
    }

    // Inventário de Tropas
    const troopsRes = await client.query(
      'SELECT troop_id, owned_count, is_unlocked, custom_attack, custom_health FROM troop_inventory WHERE profile_id = $1',
      ['main_profile']
    );
    const ownedTroopCounts: Record<string, number> = {};
    const unlockedTroopIds: string[] = [];
    const customTroopStats: Record<string, { attack: number; health: number }> = {};

    for (const t of troopsRes.rows) {
      ownedTroopCounts[t.troop_id] = t.owned_count;
      if (t.is_unlocked) {
        unlockedTroopIds.push(t.troop_id);
      }
      if (t.custom_attack != null && t.custom_health != null) {
        customTroopStats[t.troop_id] = {
          attack: t.custom_attack,
          health: t.custom_health,
        };
      }
    }

    client.release();

    const fullProfile = {
      heroId: row.hero_id,
      heroName: row.hero_name,
      heroLevel: row.hero_level,
      includeHero: row.include_hero,
      capitolLevel: row.capitol_level,
      dragonLevel: row.dragon_level,
      maxMarchCapacity: row.max_march_capacity,
      mercenaryCapacity: row.mercenary_capacity,
      specialCapacity: row.special_capacity,
      selectedCaptainId: row.selected_captain_id,
      selectedCaptainIds: row.selected_captain_ids,
      captainLevels,
      unlockedTroopIds,
      ownedTroopCounts,
      customTroopStats,
      customTroops: row.custom_troops || [],
      academyBonus: row.academy_bonus,
    };

    res.json({ profile: fullProfile });
  } catch (err: any) {
    console.error('[API Error /profile GET]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile (Save / Update entire profile)
app.post('/api/profile', async (req, res) => {
  try {
    const p = req.body;
    const client = await pool.connect();

    // Upsert player_profiles
    await client.query(
      `
      INSERT INTO player_profiles (
        id, hero_id, hero_name, hero_level, include_hero, capitol_level, dragon_level,
        max_march_capacity, mercenary_capacity, special_capacity,
        selected_captain_id, selected_captain_ids, academy_bonus, custom_troops, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        hero_id = EXCLUDED.hero_id,
        hero_name = EXCLUDED.hero_name,
        hero_level = EXCLUDED.hero_level,
        include_hero = EXCLUDED.include_hero,
        capitol_level = EXCLUDED.capitol_level,
        dragon_level = EXCLUDED.dragon_level,
        max_march_capacity = EXCLUDED.max_march_capacity,
        mercenary_capacity = EXCLUDED.mercenary_capacity,
        special_capacity = EXCLUDED.special_capacity,
        selected_captain_id = EXCLUDED.selected_captain_id,
        selected_captain_ids = EXCLUDED.selected_captain_ids,
        academy_bonus = EXCLUDED.academy_bonus,
        custom_troops = EXCLUDED.custom_troops,
        updated_at = NOW()
      `,
      [
        'main_profile',
        p.heroId || 'garvel',
        p.heroName || 'Araning',
        p.heroLevel || 16,
        p.includeHero ?? true,
        p.capitolLevel || 16,
        p.dragonLevel || 15,
        p.maxMarchCapacity || 3125,
        p.mercenaryCapacity || 1540,
        p.specialCapacity || 770,
        p.selectedCaptainId || 'brunhild',
        JSON.stringify(p.selectedCaptainIds || ['brunhild', 'xi_guiying', 'aydae']),
        JSON.stringify(p.academyBonus || {}),
        JSON.stringify(p.customTroops || []),
      ]
    );

    // Upsert captain_levels
    if (p.captainLevels) {
      for (const [capId, lvl] of Object.entries(p.captainLevels)) {
        await client.query(
          `
          INSERT INTO captain_levels (profile_id, captain_id, level)
          VALUES ($1, $2, $3)
          ON CONFLICT (profile_id, captain_id) DO UPDATE SET level = EXCLUDED.level
          `,
          ['main_profile', capId, lvl]
        );
      }
    }

    // Upsert troop_inventory
    if (p.ownedTroopCounts) {
      for (const [troopId, count] of Object.entries(p.ownedTroopCounts)) {
        const isUnlocked = p.unlockedTroopIds ? p.unlockedTroopIds.includes(troopId) : true;
        const custom = p.customTroopStats?.[troopId];
        await client.query(
          `
          INSERT INTO troop_inventory (profile_id, troop_id, owned_count, is_unlocked, custom_attack, custom_health)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (profile_id, troop_id) DO UPDATE SET
            owned_count = EXCLUDED.owned_count,
            is_unlocked = EXCLUDED.is_unlocked,
            custom_attack = EXCLUDED.custom_attack,
            custom_health = EXCLUDED.custom_health
          `,
          ['main_profile', troopId, count, isUnlocked, custom?.attack || null, custom?.health || null]
        );
      }
    }

    client.release();
    res.json({ success: true, message: 'Perfil salvo com sucesso no PostgreSQL' });
  } catch (err: any) {
    console.error('[API Error /profile POST]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Inicia servidor e banco
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[API Server] Rodando em http://localhost:${PORT}`);
  });
});
