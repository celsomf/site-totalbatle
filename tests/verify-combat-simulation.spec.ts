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

  // 6. Validar que o componente BattlePreview (Prévia da Batalha) está visível em modo acordeon
  const battlePreviewTitle = page.getByRole('heading', { name: /Prévia da Batalha/i });
  await expect(battlePreviewTitle).toBeVisible();

  // 7. Tirar screenshot do acordeon fechado (modo compacto)
  const battlePreviewSection = page.locator('#battle-preview-section');
  await expect(battlePreviewSection).toBeVisible();
  await battlePreviewSection.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/battle_preview_accordion_collapsed.png',
  });

  // 8. Abrir o acordeon clicando no botão "Ver Prévia"
  const openPreviewBtn = page.locator('button:has-text("Ver Prévia")');
  await expect(openPreviewBtn).toBeVisible();
  await openPreviewBtn.click();
  await page.waitForTimeout(300);

  // 9. Validar que a Arena Visual apareceu com os dois lados
  const playerSide = page.locator('text=/Atacante/i').first();
  await expect(playerSide).toBeVisible();

  const enemySide = page.locator('text=/Esquadrões Inimigos/i').first();
  await expect(enemySide).toBeVisible();

  // 10. Validar que o reprodutor de batalha foi removido (não existem botões de play/pause/anterior/próximo)
  const oldPlayerBtn = page.locator('button[title="Próxima etapa"]');
  await expect(oldPlayerBtn).toHaveCount(0);

  // 11. Tirar screenshot da Arena Visual aberta
  await battlePreviewSection.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/battle_preview_accordion_expanded.png',
  });

  // 12. Testar alternância para "Log Turno a Turno"
  const logTabBtn = page.locator('button:has-text("Log Turno a Turno")');
  await expect(logTabBtn).toBeVisible();
  await logTabBtn.click();
  await page.waitForTimeout(300);

  // 13. Fechar o acordeon clicando em "Ocultar"
  const closePreviewBtn = page.locator('button:has-text("Ocultar")');
  await expect(closePreviewBtn).toBeVisible();
  await closePreviewBtn.click();
  await page.waitForTimeout(300);

  // 14. Tirar screenshot geral da tela
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/combat_simulator_defeat_lock.png',
  });

  console.log('Teste de validação do simulador e prévia de batalha concluído com sucesso!');
});

test('validar botão de recalcular marcha e opção de subir de nível rápido (XP Farm)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

  // 1. Ir para o Livro de Marcha
  await page.click('button:has-text("Livro de Marcha")');
  await page.waitForTimeout(600);

  // 2. Verificar presença do Badge de Sincronização com Quartel
  const syncBadge = page.locator('text=/Sincronizado com Quartel/i');
  await expect(syncBadge).toBeVisible();

  // 3. Verificar presença da opção "Subir de Nível Rápido (XP Farm)" acima do nível
  const fastLevelingOption = page.locator('text=/Subir de Nível Rápido/i');
  await expect(fastLevelingOption).toBeVisible();

  // 4. Testar clique no botão "Recalcular Marcha"
  const recalcBtn = page.locator('button:has-text("Recalcular Marcha")');
  await expect(recalcBtn).toBeVisible();
  await recalcBtn.click();

  // 5. Validar que o toast de confirmação aparece
  const toast = page.locator('text=/Marcha e simulação recalculadas com sucesso/i');
  await expect(toast).toBeVisible();

  // 6. Tirar screenshot da tela comprovando o botão de recalcular, o badge e a opção de nível rápido
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/recalculate_and_fast_leveling.png',
  });

  console.log('Teste de validação do Recalcular e Subir de Nível Rápido concluído com sucesso!');
});

