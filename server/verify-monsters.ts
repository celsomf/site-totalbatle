import { pool } from './db';

async function verify() {
  const ids = [
    // Lote 1
    'goblin',
    'cavalgante_pegaso',
    'druida',
    'arqueiro_elfico',
    'demonio_chifres',
    // Lote 2
    'demonio',
    'centauro',
    'cavalgante_cao_morte',
    'banshee',
    'carnical',
    // Lote 3
    'vampiro',
    'feiticeiro',
    'esqueleto',
    'cavalgante_da_morte',
    'cerbero_demonio',
    // Lote 4
    'cavalgante_fogo',
    'capataz',
    'corvo_tempestade',
    'lancador_machados',
    'cavalgante_lobo',
    // Lote 5
    'licantropo',
    'cavalgante_verme_fogo',
    'ogro_xama',
    'necromante',
    // Lote 6
    'carrasco',
    'cavalgante_jaguar',
    'cavalgante_trevas',
    'gargula',
    'ciclope',
    // Lote 7
    'cavalgante_unicornio',
    'ent',
    'dragao_vida',
    // Lote 8
    'abominacao',
    'cavalgante_escorpiao',
    'cavalgante_touro',
    // Lote 9
    'verme_areia'
  ];
  const res = await pool.query(
    'SELECT id, name, family, sub_type, troop_class, tier, unit_attack, unit_health, leadership, initiative, aspects FROM monster_units WHERE id = ANY($1) ORDER BY family, tier, name',
    [ids]
  );
  console.log(`--- Total Verificados: ${res.rows.length} / ${ids.length} ---`);
  for (const row of res.rows) {
    console.log(`[${row.id}] ${row.name}`);
    console.log(`  Família: ${row.family} | Subtipo: ${row.sub_type}`);
    console.log(`  Tier: ${row.tier} | Classe: ${row.troop_class}`);
    console.log(`  Força: ${row.unit_attack} | Saúde: ${row.unit_health}`);
    console.log(`  Liderança: ${row.leadership} | Iniciativa: ${row.initiative}`);
    console.log(`  Aspectos:`, JSON.stringify(row.aspects));
    console.log('----------------------------------------------------');
  }
  console.log(`\n====================================================`);
  console.log(`TOTAL VERIFICADOS NO BANCO: ${res.rows.length} de ${ids.length} consultados.`);
  console.log(`====================================================\n`);
  await pool.end();
}

verify().catch(console.error);
