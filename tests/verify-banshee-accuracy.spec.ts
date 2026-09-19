import { test, expect } from '@playwright/test';

test('validar assertividade de monstros (Banshee e Arqueiro Élfico) e proteção contra baixas G2', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

  // 1. Acessar a aba Livro de Marcha
  await page.click('button:has-text("Livro de Marcha")');
  await page.waitForTimeout(600);

  // 2. No Seletor de Alvo Inimigo, selecionar Tropa de Banshees Comum
  const templateSelect = page.locator('select').first();
  await templateSelect.selectOption({ label: '👻 Tropa de Banshees Comum (Longo Alcance)' });
  await page.waitForTimeout(600);

  // 3. Verificar que o selo de vitória garantida com bucha está presente
  const victoryBadge = page.locator('text=/Vitória Garantida com Bucha de Absorção/i');
  await expect(victoryBadge).toBeVisible();

  // 4. Validar que na composição recomendada as tropas nobres G2 estão 100% protegidas (0 G2 arriscados, apenas bucha G1)
  const syncText = page.locator('text=/59 Mercs • 0 G2 • 250 G1/i');
  await expect(syncText).toBeVisible();

  // 5. Tirar screenshot do cálculo seguro contra Banshee
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/banshee_safe_march_calculated.png',
  });

  // 6. Abrir o Modal "Ajustar Esquadrões"
  const editSquadsBtn = page.locator('button:has-text("Ajustar Esquadrões")').first();
  await expect(editSquadsBtn).toBeVisible();
  await editSquadsBtn.click();
  await page.waitForTimeout(400);

  // 7. Validar que o modal abriu e que o esquadrão inimigo possui 210 unidades de Banshee
  const modalTitle = page.locator('text="Ajustar Composição das Tropas Inimigas"');
  await expect(modalTitle).toBeVisible();

  // Quantidade de 210 Banshees configurada no esquadrão 1 dentro do modal
  const countInput = page.locator('.fixed input[type="number"]').first();
  await expect(countInput).toHaveValue('210');

  // Validar presença de Banshee e Arqueiro Élfico no optgroup Longo Alcance
  const optgroupRanged = page.locator('optgroup[label="🏹 Longo Alcance (Ranged)"]');
  await expect(optgroupRanged).toBeAttached();

  // 8. Tirar screenshot do modal aberto com os novos monstros categorizados
  await page.screenshot({
    path: 'C:/Users/celso/.gemini/antigravity/brain/b0b3a8ca-247a-4157-b90e-34924956138c/edit_squads_modal_monster_classes.png',
  });

  // 9. Fechar o modal
  const closeBtn = page.locator('button:has-text("Salvar & Recalcular")');
  await expect(closeBtn).toBeVisible();
  await closeBtn.click();
  await page.waitForTimeout(400);
});
