import { test } from '@playwright/test';

test('Abrir Total Battle no navegador visivel e fechar modais/janela de exercito', async ({ page }) => {
  test.setTimeout(120000); // 2 minutos

  console.log('[1/4] Acessando Total Battle...');
  await page.goto('https://totalbattle.com');

  console.log('[2/4] Aguardando carregamento da interface...');
  await page.waitForTimeout(10000);

  console.log('[3/4] Focando na tela e enviando atalhos de fechamento...');
  // Clica no centro da tela para garantir o foco no jogo/canvas
  const size = page.viewportSize() || { width: 1280, height: 720 };
  await page.mouse.click(size.width / 2, size.height / 2);

  // Envia tecla Escape para fechar qualquer janela/modal aberta (ex: exército)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');

  console.log('[4/4] Ação de fechar executada!');
  await page.waitForTimeout(5000);
});
