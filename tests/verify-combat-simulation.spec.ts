import { test, expect } from '@playwright/test';

test('validar simulador de combate real com alerta de derrota certa para Tropa de Elfos Nv 14', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

  // 1. Garantir que estamos na aba Livro de Marcha
  await page.click('button:has-text("Livro de Marcha")');
  await page.waitForTimeout(600);

  // 2. No Seletor de Alvo Inimigo, selecionar Tropa de Elfos Comum
  const templateSelect = page.locator('select').first();
  await templateSelect.selectOption({ label: '🌿 Tropa de Elfos Comum' });
  await page.waitForTimeout(600);

  // 3. Validar que o alerta vermelho DERROTA CERTA (NÃO MARCHAR) é exibido
  const defeatBanner = page.locator('text="DERROTA CERTA (100% de Baixas)"');
  await expect(defeatBanner).toBeVisible();

  const doNotMarch = page.locator('text="NÃO MARCHAR"');
  await expect(doNotMarch).toBeVisible();

  // 5. Validar que a caixa de requisitos de tropas necessárias é exibida
  const requirementText = page.locator('text="O que você precisa produzir no Quartel para vencer:"');
  await expect(requirementText).toBeVisible();

  // 6. Abrir gaveta de Simulação Turno a Turno
  const combatLogBtn = page.locator('button:has-text("Ver Simulação Turno a Turno")');
  await expect(combatLogBtn).toBeVisible();
  await combatLogBtn.click();
  await page.waitForTimeout(600);

  // 7. Tirar screenshot da tela comprovando o alerta de derrota e a simulação turno a turno
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/combat_simulator_defeat_lock.png',
    fullPage: true,
  });

  console.log('Teste de validação do simulador de combate concluído com sucesso!');
});
