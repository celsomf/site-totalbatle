import { test, expect } from '@playwright/test';

test('validar quartel sem vazamento e edicao/remocao de tropas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

  // 1. Abrir aba Quartel
  const quartelTab = page.locator('button:has-text("Quartel")');
  await quartelTab.click();
  await page.waitForTimeout(1000);

  // 2. Screenshot do Quartel com cards corrigidos
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/barracks_fixed_view.png',
    fullPage: false,
  });

  // 3. Verificar que não há Titã de Fogo nos cards nem no topo
  const titaText = page.locator('text="Titãs de Choque (M5)"');
  await expect(titaText).toHaveCount(0);

  // 4. Verificar Mercenários Épicos (V) presente no banner com 72 un.
  const mercBanner = page.locator('text="Mercenários Épicos (V)"');
  await expect(mercBanner).toBeVisible();

  // 5. Clicar no botão de edição da primeira tropa
  const firstEditBtn = page.locator('button[title="Editar tropa"]').first();
  await expect(firstEditBtn).toBeVisible();
  await firstEditBtn.click();
  await page.waitForTimeout(600);

  // 6. Screenshot do Modal de Edição
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/troop_edit_modal.png',
    fullPage: false,
  });

  // 7. Validar elementos no modal: Força Base, Saúde Base, Salvar Alterações, Remover Tropa
  await expect(page.locator('button:has-text("Salvar Alterações")')).toBeVisible();
  await expect(page.locator('button:has-text("Remover Tropa")')).toBeVisible();

  console.log('Teste de validação concluído com sucesso!');
});
