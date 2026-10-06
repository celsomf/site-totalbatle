import { initDatabase, pool } from '../server/db';
import { mutateCatalogFormations } from '../server/catalogApi';
import { isCatalogWriteAuthorized } from '../server/gameCatalog';

let schemaReady: Promise<boolean> | undefined;

async function ensureSchema() {
  schemaReady ||= initDatabase();
  if (!(await schemaReady)) throw new Error('Banco de dados indisponível.');
}

export async function POST(request: Request) {
  if (!isCatalogWriteAuthorized(request.headers.get('authorization') || undefined)) {
    const tokenConfigured = Boolean(process.env.CATALOG_WRITE_TOKEN);
    return Response.json(
      { error: tokenConfigured ? 'Chave de edição inválida ou ausente.' : 'A edição compartilhada está sem chave de segurança configurada.' },
      { status: tokenConfigured ? 401 : 503 }
    );
  }

  try {
    await ensureSchema();
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: 'Corpo JSON inválido.' }, { status: 400 });
    }
    return Response.json(await mutateCatalogFormations(pool, payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível salvar a formação.';
    const clientError = /inválid|informe|encontrad|mesm|limite|quantidade|catálogo|origem|destino|família|monstro/i.test(message);
    return Response.json({ error: message }, { status: clientError ? 400 : 500 });
  }
}
