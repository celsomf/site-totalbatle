import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDatabase } from './db';
import { isCatalogWriteAuthorized } from './gameCatalog';
import { mutateCatalogFormations, readCatalog } from './catalogApi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Catálogos de leitura e formações compartilhadas do jogo.
app.get('/api/catalog', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await readCatalog(pool));
  } catch (err: any) {
    console.error('[API Error /catalog GET]:', err.message);
    res.status(503).json({ error: 'Não foi possível carregar os dados do catálogo.' });
  }
});

app.post('/api/monster-formations', async (req, res) => {
  if (!isCatalogWriteAuthorized(req.header('authorization'))) {
    const tokenConfigured = Boolean(process.env.CATALOG_WRITE_TOKEN);
    return res.status(tokenConfigured ? 401 : 503).json({
      error: tokenConfigured ? 'Chave de edição inválida ou ausente.' : 'A edição compartilhada está sem chave de segurança configurada.',
    });
  }

  try {
    res.json(await mutateCatalogFormations(pool, req.body));
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Não foi possível salvar a formação.';
    const clientError = /inválid|informe|encontrad|mesm|limite|quantidade|catálogo|origem|destino|família|monstro/i.test(message);
    res.status(clientError ? 400 : 500).json({ error: message });
  }
});

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

// GET /api/profiles (List all player profiles)
app.get('/api/profiles', async (_req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT id, player_name AS "playerName", kingdom, clan_tag AS "clanTag", 
              capitol_level AS "capitolLevel", hero_id AS "heroId", updated_at AS "updatedAt" 
       FROM player_profiles 
       ORDER BY updated_at DESC`
    );
    client.release();
    res.json({ profiles: result.rows });
  } catch (err: any) {
    console.error('[API Error /profiles GET]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile or /api/profile/:id
app.get(['/api/profile', '/api/profile/:id'], async (req, res) => {
  try {
    const targetId = req.params.id || (req.query.id as string) || 'main_profile';
    const client = await pool.connect();
    
    // Perfil base
    let profileRes = await client.query(
      'SELECT * FROM player_profiles WHERE id = $1',
      [targetId]
    );

    if (profileRes.rows.length === 0 && targetId === 'main_profile') {
      // Se 'main_profile' não existir, tenta pegar o perfil mais recente
      profileRes = await client.query(
        'SELECT * FROM player_profiles ORDER BY updated_at DESC LIMIT 1'
      );
    }

    if (profileRes.rows.length === 0) {
      client.release();
      return res.json({ profile: null });
    }

    const row = profileRes.rows[0];
    const actualProfileId = row.id;

    // Níveis de Capitães
    const captainsRes = await client.query(
      'SELECT captain_id, level FROM captain_levels WHERE profile_id = $1',
      [actualProfileId]
    );
    const captainLevels: Record<string, number> = {};
    for (const c of captainsRes.rows) {
      captainLevels[c.captain_id] = c.level;
    }

    // Inventário de Tropas
    const troopsRes = await client.query(
      'SELECT troop_id, owned_count, is_unlocked, custom_attack, custom_health FROM troop_inventory WHERE profile_id = $1',
      [actualProfileId]
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
      id: row.id,
      playerName: row.player_name || 'Comandante',
      kingdom: row.kingdom || 'K:310',
      clanTag: row.clan_tag || '',
      heroId: row.hero_id,
      heroName: row.hero_name || row.player_name || 'Comandante',
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
      activeMarches: row.active_marches || [],
      attackHistory: row.attack_history || [],
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

// POST /api/profile or /api/profile/:id (Save / Update entire profile)
app.post(['/api/profile', '/api/profile/:id'], async (req, res) => {
  try {
    const p = req.body;
    const profileId = req.params.id || p.id || 'main_profile';
    const client = await pool.connect();

    // Upsert player_profiles
    await client.query(
      `
      INSERT INTO player_profiles (
        id, player_name, kingdom, clan_tag, hero_id, hero_name, hero_level, include_hero, capitol_level, dragon_level,
        max_march_capacity, mercenary_capacity, special_capacity,
        selected_captain_id, selected_captain_ids, academy_bonus, custom_troops, active_marches, attack_history, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
      ON CONFLICT (id) DO UPDATE SET
        player_name = EXCLUDED.player_name,
        kingdom = EXCLUDED.kingdom,
        clan_tag = EXCLUDED.clan_tag,
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
        active_marches = EXCLUDED.active_marches,
        attack_history = EXCLUDED.attack_history,
        updated_at = NOW()
      `,
      [
        profileId,
        p.playerName || p.heroName || 'Comandante',
        p.kingdom || 'K:310',
        p.clanTag || '',
        p.heroId || 'garvel',
        p.heroName || p.playerName || 'Comandante',
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
        JSON.stringify(p.activeMarches || []),
        JSON.stringify(p.attackHistory || []),
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
          [profileId, capId, lvl]
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
          [profileId, troopId, count, isUnlocked, custom?.attack || null, custom?.health || null]
        );
      }
    }

    client.release();
    res.json({ success: true, message: `Perfil '${profileId}' salvo com sucesso no PostgreSQL` });
  } catch (err: any) {
    console.error('[API Error /profile POST]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/profile/:id (Delete a profile and associated inventory/captains)
app.delete('/api/profile/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    if (!profileId) {
      return res.status(400).json({ error: 'ID de perfil obrigatório' });
    }

    const client = await pool.connect();
    await client.query('DELETE FROM troop_inventory WHERE profile_id = $1', [profileId]);
    await client.query('DELETE FROM captain_levels WHERE profile_id = $1', [profileId]);
    await client.query('DELETE FROM player_profiles WHERE id = $1', [profileId]);
    client.release();

    res.json({ success: true, message: `Perfil '${profileId}' excluído com sucesso.` });
  } catch (err: any) {
    console.error('[API Error /profile DELETE]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/monsters (List all registered monster units)
app.get('/api/monsters', async (_req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, tier, family, sub_type AS "subType", troop_class AS "troopClass", unit_attack AS "unitAttack", unit_health AS "unitHealth", leadership, initiative, aspects FROM monster_units ORDER BY family, tier, name'
    );
    client.release();
    res.json({ monsters: result.rows });
  } catch (err: any) {
    console.error('[API Error /monsters GET]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/monsters (Upsert single monster unit)
app.post('/api/monsters', async (req, res) => {
  if (!isCatalogWriteAuthorized(req.header('authorization'))) {
    return res.status(process.env.CATALOG_WRITE_TOKEN ? 401 : 503).json({ error: 'Acesso de edição não autorizado.' });
  }
  try {
    const m = req.body;
    if (!m.id || !m.name || m.unitAttack == null || m.unitHealth == null) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (id, name, unitAttack, unitHealth)' });
    }

    const client = await pool.connect();
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
        updated_at = NOW()
      `,
      [
        m.id,
        m.name,
        m.tier || 1,
        m.family || 'barbarian',
        m.subType || '',
        m.troopClass || 'melee',
        m.unitAttack,
        m.unitHealth,
        m.leadership || 1,
        m.initiative || 10,
        JSON.stringify(m.aspects || {}),
        m.isEnemy ?? true,
        m.unitType || 'enemy_monster',
      ]
    );

    client.release();
    res.json({ success: true, message: `Monstro '${m.name}' salvo com sucesso.` });
  } catch (err: any) {
    console.error('[API Error /monsters POST]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/monsters/bulk (Upsert multiple monster units in batch)
app.post('/api/monsters/bulk', async (req, res) => {
  if (!isCatalogWriteAuthorized(req.header('authorization'))) {
    return res.status(process.env.CATALOG_WRITE_TOKEN ? 401 : 503).json({ error: 'Acesso de edição não autorizado.' });
  }
  try {
    const { monsters } = req.body;
    if (!Array.isArray(monsters) || monsters.length === 0) {
      return res.status(400).json({ error: 'Array de monstros vazio ou inválido' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const m of monsters) {
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
            updated_at = NOW()
          `,
          [
            m.id,
            m.name,
            m.tier || 1,
            m.family || 'barbarian',
            m.subType || '',
            m.troopClass || 'melee',
            m.unitAttack,
            m.unitHealth,
            m.leadership || 1,
            m.initiative || 10,
            JSON.stringify(m.aspects || {}),
            m.isEnemy ?? true,
            m.unitType || 'enemy_monster',
          ]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.json({ success: true, count: monsters.length, message: `${monsters.length} monstros salvos com sucesso.` });
  } catch (err: any) {
    console.error('[API Error /monsters/bulk POST]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Inicia servidor somente quando o banco, fonte oficial dos dados, estiver acessível.
initDatabase().then((initialized) => {
  if (!initialized) {
    console.error('[API Server] Inicialização cancelada: banco de dados indisponível.');
    process.exitCode = 1;
    return;
  }
  app.listen(PORT, () => {
    console.log(`[API Server] Rodando em http://localhost:${PORT}`);
  });
});
