import { chromium } from '@playwright/test';

async function main() {
  console.log('[1/4] Lançando o Opera em modo visual (headed)...');
  
  // Tenta abrir com o Opera; se houver conflito de perfil, usa o Chromium padrão do Playwright
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      executablePath: 'C:\\Users\\celso\\AppData\\Local\\Programs\\Opera\\opera.exe',
      args: ['--start-maximized']
    });
    console.log('[2/4] Opera iniciado com sucesso.');
  } catch (e: any) {
    console.log('Iniciando com o navegador Chromium integrado:', e.message);
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });
  }

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log('[3/4] Acessando Total Battle...');
  await page.goto('https://totalbattle.com');

  console.log('[4/4] Janela aberta na tela. Aguardando 10 segundos...');
  await page.waitForTimeout(10000);

  console.log('Executando ação: Enviando tecla Escape para fechar a janela de exército...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');

  console.log('✅ Ação executada com sucesso!');
}

main();
