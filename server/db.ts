import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
  connectionTimeoutMillis: 3000,
});

export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('[PostgreSQL] Conectado com sucesso!');

    // 1. Tabela de Perfil do Jogador
    await client.query(`
      CREATE TABLE IF NOT EXISTS player_profiles (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'main_profile',
        player_name VARCHAR(100) NOT NULL DEFAULT 'Comandante',
        kingdom VARCHAR(50) NOT NULL DEFAULT 'K:310',
        clan_tag VARCHAR(20) NOT NULL DEFAULT '',
        hero_id VARCHAR(50) NOT NULL DEFAULT 'garvel',
        hero_name VARCHAR(100) NOT NULL DEFAULT 'Comandante',
        hero_level INT NOT NULL DEFAULT 16,
        include_hero BOOLEAN NOT NULL DEFAULT true,
        capitol_level INT NOT NULL DEFAULT 16,
        dragon_level INT NOT NULL DEFAULT 15,
        max_march_capacity INT NOT NULL DEFAULT 3125,
        mercenary_capacity INT NOT NULL DEFAULT 1540,
        special_capacity INT NOT NULL DEFAULT 770,
        selected_captain_ids JSONB NOT NULL DEFAULT '["brunhild", "xi_guiying", "aydae"]'::jsonb,
        selected_captain_id VARCHAR(50) NOT NULL DEFAULT 'brunhild',
        academy_bonus JSONB NOT NULL DEFAULT '{"guardsmenAttack":25,"guardsmenHealth":20,"specialistsAttack":15,"specialistsHealth":10,"monstersAttack":20,"monstersHealth":20}'::jsonb,
        custom_troops JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS player_name VARCHAR(100) DEFAULT 'Comandante';
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS kingdom VARCHAR(50) DEFAULT 'K:310';
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS clan_tag VARCHAR(20) DEFAULT '';
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS custom_troops JSONB DEFAULT '[]'::jsonb;
    `);

    // 2. Tabela de Níveis de Capitães
    await client.query(`
      CREATE TABLE IF NOT EXISTS captain_levels (
        profile_id VARCHAR(50) NOT NULL DEFAULT 'main_profile',
        captain_id VARCHAR(50) NOT NULL,
        level INT NOT NULL DEFAULT 20,
        PRIMARY KEY (profile_id, captain_id)
      );
    `);

    // 3. Tabela de Inventário e Estatísticas de Tropas
    await client.query(`
      CREATE TABLE IF NOT EXISTS troop_inventory (
        profile_id VARCHAR(50) NOT NULL DEFAULT 'main_profile',
        troop_id VARCHAR(50) NOT NULL,
        owned_count INT NOT NULL DEFAULT 0,
        is_unlocked BOOLEAN NOT NULL DEFAULT true,
        custom_attack INT,
        custom_health INT,
        PRIMARY KEY (profile_id, troop_id)
      );
    `);

    // 4. Tabela de Histórico de Marchas
    await client.query(`
      CREATE TABLE IF NOT EXISTS march_history (
        id SERIAL PRIMARY KEY,
        target_id VARCHAR(50) NOT NULL,
        target_name VARCHAR(100) NOT NULL,
        target_level INT NOT NULL,
        total_march_size INT NOT NULL,
        squads JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabela de Unidades de Monstros
    await client.query(`
      CREATE TABLE IF NOT EXISTS monster_units (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        tier INT NOT NULL,
        family VARCHAR(50) NOT NULL,
        sub_type VARCHAR(150) NOT NULL,
        troop_class VARCHAR(50) NOT NULL,
        unit_attack INT NOT NULL,
        unit_health INT NOT NULL,
        leadership INT NOT NULL,
        initiative INT NOT NULL,
        aspects JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_enemy BOOLEAN NOT NULL DEFAULT true,
        unit_type VARCHAR(50) NOT NULL DEFAULT 'enemy_monster',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS is_enemy BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50) NOT NULL DEFAULT 'enemy_monster';
    `);

    client.release();
    console.log('[PostgreSQL] Tabelas inicializadas com sucesso.');
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] Aviso ao conectar/inicializar banco:', err.message);
    return false;
  }
}
