import { pool } from './db';

async function checkSandworm() {
  const res = await pool.query(
    'SELECT id, name, family, sub_type, tier, troop_class, unit_attack, unit_health, leadership, initiative, aspects, is_enemy, unit_type FROM monster_units WHERE id = $1',
    ['verme_areia']
  );
  if (res.rows.length === 0) {
    console.error('ERRO: Verme da Areia não encontrado no banco!');
    process.exit(1);
  }
  const r = res.rows[0];
  console.log('--- SUCESSO: VERME DA AREIA VERIFICADO NO POSTGRESQL ---');
  console.log(`[${r.id}] ${r.name}`);
  console.log(`  Família: ${r.family} | Subtipo: ${r.sub_type}`);
  console.log(`  Tier: ${r.tier} | Classe: ${r.troop_class}`);
  console.log(`  Tipo da Unidade: ${r.unit_type} | É Inimigo: ${r.is_enemy}`);
  console.log(`  Força: ${r.unit_attack.toLocaleString('pt-BR')} | Saúde: ${r.unit_health.toLocaleString('pt-BR')}`);
  console.log(`  Liderança: ${r.leadership} | Iniciativa: ${r.initiative}`);
  console.log(`  Aspectos:`, JSON.stringify(r.aspects));
  console.log('---------------------------------------------------------');
  await pool.end();
}

checkSandworm().catch(console.error);
