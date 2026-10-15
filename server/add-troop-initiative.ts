import { mkdir, writeFile } from 'node:fs/promises';
import { pool } from './db';

if (process.argv[2] !== '--apply') throw new Error('Use --apply');
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const row = await client.query('SELECT * FROM troop_catalog WHERE id=$1 FOR UPDATE', ['epic_monster_hunter_vi']);
  if (row.rowCount !== 1 || row.rows[0].base_attack !== 2030 || row.rows[0].base_health !== 6090 || ![undefined, null, 10].includes(row.rows[0].initiative)) throw new Error('Ficha VI diverge das evidências');
  await mkdir('.local-backups/motor-evidencias-20261015', { recursive: true });
  await writeFile(`.local-backups/motor-evidencias-20261015/initiative-before-${Date.now()}.json`, JSON.stringify(row.rows, null, 2));
  await client.query('ALTER TABLE troop_catalog ADD COLUMN IF NOT EXISTS initiative INT');
  await client.query('UPDATE troop_catalog SET initiative=$2 WHERE id=$1', ['epic_monster_hunter_vi', 10]);
  await client.query('COMMIT');
  const check = await client.query('SELECT id,initiative,base_attack,base_health FROM troop_catalog WHERE id=$1', ['epic_monster_hunter_vi']);
  console.log(JSON.stringify({ status: 'PASS', unit: check.rows[0], inventoryWrites: 0, profileWrites: 0 }));
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { client.release(); await pool.end(); }
