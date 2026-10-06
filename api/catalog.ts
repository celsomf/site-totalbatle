import { initDatabase, pool } from '../server/db';
import { readCatalog } from '../server/catalogApi';

let schemaReady: Promise<boolean> | undefined;

async function ensureSchema() {
  schemaReady ||= initDatabase();
  if (!(await schemaReady)) throw new Error('Banco de dados indisponível.');
}

export async function GET() {
  try {
    await ensureSchema();
    const catalog = await readCatalog(pool);
    return Response.json(catalog, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json(
      { error: 'Não foi possível carregar os dados do catálogo.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
