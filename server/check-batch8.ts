import { pool } from './db';

async function check() {
  const ids = ['abominacao', 'cavalgante_escorpiao', 'cavalgante_touro', 'lancador_machados', 'cavalgante_lobo'];
  const res = await pool.query(
    'SELECT id, name, family, sub_type, tier, troop_class, unit_attack, unit_health, leadership, initiative, aspects, is_enemy, unit_type FROM monster_units WHERE id = ANY($1) ORDER BY id',
    [ids]
  );
  console.log(`Encontrados: ${res.rows.length} / ${ids.length}`);
  for (const r of res.rows) {
    console.log(`[${r.id}] ${r.name}`);
    console.log(`  Família: ${r.family} | Subtipo: ${r.sub_type}`);
    console.log(`  Tier: ${r.tier} | Classe: ${r.troop_class}`);
    console.log(`  Tipo da Unidade: ${r.unit_type} | É Inimigo: ${r.is_enemy}`);
    console.log(`  Força: ${r.unit_attack} | Saúde: ${r.unit_health}`);
    console.log(`  Liderança: ${r.leadership} | Iniciativa: ${r.initiative}`);
    console.log(`  Aspectos:`, JSON.stringify(r.aspects));
    console.log('----------------------------------------------------');
  }
  await pool.end();
}

check().catch(console.error);
