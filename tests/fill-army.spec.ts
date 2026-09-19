import { test, expect } from '@playwright/test';

test('Preencher e validar exercito do jogador', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  // Valida que os capitães do print estão visíveis pelos botões
  await expect(page.getByRole('button', { name: /Brunhild/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Aydae/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Leônidas/i })).toBeVisible();

  // Valida que o estoque de tropas do print está preenchido
  await expect(page.getByText('Arqueiro de Linha (G2)')).toBeVisible();
  await expect(page.getByText('Guerreiro Veterano (G2)')).toBeVisible();

  // Clica no botão de restaurar para garantir sincronização
  const restoreBtn = page.getByRole('button', { name: /Restaurar/i });
  await restoreBtn.click();

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'dist/exercito_validado.png', fullPage: true });
});
