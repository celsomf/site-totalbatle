import { chromium } from '@playwright/test';

async function closeArmyWindow() {
  const cdpUrl = 'http://localhost:9222';
  console.log(`[1/4] Tentando conectar à janela do Opera existente via CDP (${cdpUrl})...`);

  try {
    const browser = await chromium.connectOverCDP(cdpUrl);
    console.log('[2/4] Conectado com sucesso ao navegador!');

    const contexts = browser.contexts();
    const pages = contexts.flatMap(c => c.pages());

    console.log(`[3/4] Abas encontradas: ${pages.length}`);
    for (const p of pages) {
      console.log(`  - URL: ${p.url()} | Título: ${await p.title()}`);
    }

    // Busca a aba do Total Battle ou usa a primeira aba ativa
    const targetPage = pages.find(p => p.url().includes('totalbattle') || p.url().includes('total-battle')) || pages[0];

    if (!targetPage) {
      console.error('Nenhuma aba encontrada.');
      await browser.close();
      return;
    }

    console.log(`[4/4] Enviando comando para fechar a janela de exército na aba: ${await targetPage.title()}...`);
    
    // Traz a aba para frente
    await targetPage.bringToFront();

    // Pressiona Escape (que fecha janelas/modais no Total Battle)
    await targetPage.keyboard.press('Escape');
    await targetPage.waitForTimeout(500);
    await targetPage.keyboard.press('Escape');

    console.log('✅ Ação executada com sucesso: Tecla Escape enviada para fechar a janela de exército.');
  } catch (error: any) {
    console.error('⚠️ Não foi possível conectar na porta 9222.');
    console.error('Motivo:', error.message);
    console.log('\n👉 Para conectar à sua janela do Opera, inicie o Opera com a porta de depuração:');
    console.log('& "C:\\Users\\celso\\AppData\\Local\\Programs\\Opera\\opera.exe" --remote-debugging-port=9222\n');
  }
}

closeArmyWindow();
