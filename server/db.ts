import { Pool, type PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionOptions = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'postgres',
    };

export const pool = new Pool({
  ...connectionOptions,
  ssl: process.env.PGSSLMODE === 'require'
    ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined,
  max: Math.max(1, Number(process.env.PGPOOL_MAX) || 5),
  connectionTimeoutMillis: 3000,
});

export async function initDatabase() {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
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
        active_marches JSONB NOT NULL DEFAULT '[]'::jsonb,
        attack_history JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS player_name VARCHAR(100) DEFAULT 'Comandante';
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS kingdom VARCHAR(50) DEFAULT 'K:310';
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS clan_tag VARCHAR(20) DEFAULT '';
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS custom_troops JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS active_marches JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS attack_history JSONB NOT NULL DEFAULT '[]'::jsonb;
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
        aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
        avatar_path TEXT,
        detail_image_path TEXT,
        is_enemy BOOLEAN NOT NULL DEFAULT true,
        unit_type VARCHAR(50) NOT NULL DEFAULT 'enemy_monster',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS is_enemy BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50) NOT NULL DEFAULT 'enemy_monster';
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS aliases JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS avatar_path TEXT;
      ALTER TABLE monster_units ADD COLUMN IF NOT EXISTS detail_image_path TEXT;
    `);

    // 6. Catálogo global de tropas (separado do inventário de cada perfil).
    await client.query(`
      CREATE TABLE IF NOT EXISTS troop_catalog (
        id VARCHAR(80) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        category VARCHAR(30) NOT NULL,
        tier INT NOT NULL,
        troop_class VARCHAR(30) NOT NULL,
        base_attack INT NOT NULL,
        base_health INT NOT NULL,
        revival_silver_cost INT NOT NULL DEFAULT 0,
        revival_gold_cost INT,
        leadership_cost INT NOT NULL DEFAULT 1,
        speed INT,
        capacity INT,
        food_consumption INT,
        aspects JSONB NOT NULL DEFAULT '{}'::jsonb,
        avatar_icon VARCHAR(120),
        avatar_path TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Alvos por família e nível. A formação de cada alvo é composta pelas linhas
    // de monster_formation_units; uma combinação monstro + alvo só aparece uma vez.
    await client.query(`
      CREATE TABLE IF NOT EXISTS monster_target_templates (
        id VARCHAR(80) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        faction VARCHAR(50) NOT NULL,
        watchtower_family_id VARCHAR(50) NOT NULL,
        watchtower_family_name VARCHAR(100) NOT NULL,
        watchtower_avatar_unit_id VARCHAR(50) NOT NULL,
        attack_mode VARCHAR(20) NOT NULL,
        target_type VARCHAR(30) NOT NULL,
        default_level INT NOT NULL,
        available_levels INT[] NOT NULL DEFAULT '{}',
        description TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE monster_target_templates ADD COLUMN IF NOT EXISTS watchtower_avatar_unit_id VARCHAR(50) NOT NULL DEFAULT 'ogro_xama';

      CREATE TABLE IF NOT EXISTS monster_target_levels (
        id VARCHAR(100) PRIMARY KEY,
        template_id VARCHAR(80) NOT NULL REFERENCES monster_target_templates(id) ON DELETE CASCADE,
        level INT NOT NULL,
        xp_reward INT NOT NULL DEFAULT 0,
        valor_reward INT NOT NULL DEFAULT 0,
        tar_reward INT,
        chest_reward INT,
        guards_capacity INT NOT NULL DEFAULT 0,
        mercenaries_capacity INT NOT NULL DEFAULT 0,
        monsters_capacity INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (template_id, level)
      );

      CREATE TABLE IF NOT EXISTS monster_formation_units (
        target_level_id VARCHAR(100) NOT NULL REFERENCES monster_target_levels(id) ON DELETE CASCADE,
        monster_unit_id VARCHAR(50) NOT NULL REFERENCES monster_units(id) ON DELETE RESTRICT,
        quantity INT NOT NULL CHECK (quantity > 0),
        position INT NOT NULL DEFAULT 0,
        PRIMARY KEY (target_level_id, monster_unit_id)
      );

      CREATE TABLE IF NOT EXISTS legacy_monster_imports (
        import_id VARCHAR(100) PRIMARY KEY,
        source_key VARCHAR(120) NOT NULL UNIQUE,
        payload JSONB NOT NULL,
        imported_count INT NOT NULL DEFAULT 0,
        skipped_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[PostgreSQL] Tabelas inicializadas com sucesso.');
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] Aviso ao conectar/inicializar banco:', err.message);
    return false;
  } finally {
    client?.release();
  }
}
