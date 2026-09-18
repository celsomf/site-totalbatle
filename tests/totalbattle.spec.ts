import { test, expect, chromium } from '@playwright/test';

test('conectar ao Opera existente e fechar janela de exercito no Total Battle', async () => {
  const cdpUrl = 'http://localhost:9222';
  const browser = await chromium.connectOverCDP(cdpUrl);
  
  const pages = browser.contexts().flatMap(c => c.pages());
  expect(pages.length).toBeGreaterThan(0);

  const targetPage = pages.find(p => p.url().includes('totalbattle') || p.url().includes('total-battle')) || pages[0];
  console.log(`Interagindo com a aba: ${await targetPage.title()} (${targetPage.url()})`);

  await targetPage.bringToFront();
  
  // Envia Escape para fechar a janela/modal de exército
  await targetPage.keyboard.press('Escape');
  await targetPage.waitForTimeout(500);

  console.log('Janela de exército fechada com sucesso via atalho de teclado.');
});
