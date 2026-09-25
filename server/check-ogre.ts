import { pool } from './db';

async function checkOgre() {
  const res = await pool.query(
    'SELECT id, name, family, sub_type, tier, troop_class, unit_attack, unit_health, leadership, initiative, aspects, is_enemy, unit_type FROM monster_units WHERE id = $1',
    ['ogro_xama']
  );
  const r = res.rows[0];
  console.log('--- OGRE SHAMAN VALIDADO NO POSTGRESQL ---');
  console.log(`[${r.id}] ${r.name}`);
  console.log(`  Família: ${r.family} | Subtipo: ${r.sub_type}`);
  console.log(`  Tier: ${r.tier} | Classe: ${r.troop_class}`);
  console.log(`  Tipo da Unidade: ${r.unit_type} | É Inimigo: ${r.is_enemy}`);
  console.log(`  Força: ${r.unit_attack.toLocaleString('pt-BR')} | Saúde: ${r.unit_health.toLocaleString('pt-BR')}`);
  console.log(`  Liderança: ${r.leadership} | Iniciativa: ${r.initiative}`);
  console.log(`  Aspectos:`, JSON.stringify(r.aspects));
  console.log('------------------------------------------');
  await pool.end();
}

checkOgre().catch(console.error);
