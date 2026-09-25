import { describe, it, expect } from 'vitest';
import {
  getCaptainMonsterAttackBonus,
  getCaptainSpeedBonus,
  getCaptainCryptTarReduction,
  getCaptainComputedStats,
  getHeroAttackBonus,
  getHeroLeadershipBonus,
} from '../src/utils/captainStats';
import { DEFAULT_CAPTAINS } from '../src/data/captains';

describe('Captain & Hero Stats Calculations', () => {
  const farhad = DEFAULT_CAPTAINS.find((c) => c.id === 'farhad')!;
  const aurora = DEFAULT_CAPTAINS.find((c) => c.id === 'aurora')!;
  const xiGuiying = DEFAULT_CAPTAINS.find((c) => c.id === 'xi_guiying')!;
  const carter = DEFAULT_CAPTAINS.find((c) => c.id === 'carter')!;
  const tengel = DEFAULT_CAPTAINS.find((c) => c.id === 'tengel')!;

  it('calculates Farhad attack bonus correctly with levels and stars', () => {
    // Farhad base = 20%
    // Nível 1, 1★: 20%
    expect(getCaptainMonsterAttackBonus(farhad, 1, 1)).toBe(20);

    // Nível 15, 1★: 20 + 14 * 1.2 = 36.8%
    expect(getCaptainMonsterAttackBonus(farhad, 15, 1)).toBe(36.8);

    // Nível 15, 2★: 36.8 + 5 = 41.8%
    expect(getCaptainMonsterAttackBonus(farhad, 15, 2)).toBe(41.8);

    // Nível 15, 6★ (máx): 36.8 + 25 = 61.8%
    expect(getCaptainMonsterAttackBonus(farhad, 15, 6)).toBe(61.8);
  });

  it('calculates Aurora attack bonus correctly', () => {
    // Aurora base = 22%
    // Nível 14, 1★: 22 + 13 * 1.2 = 37.6%
    expect(getCaptainMonsterAttackBonus(aurora, 14, 1)).toBe(37.6);
  });

  it('calculates Xi Guiying attack bonus correctly', () => {
    // Xi Guiying base = 28%
    // Nível 23, 1★: 28 + 22 * 1.2 = 54.4%
    expect(getCaptainMonsterAttackBonus(xiGuiying, 23, 1)).toBe(54.4);
  });

  it('formats primary bonus label according to captain specialty', () => {
    // Monsters specialty
    const farhadStats = getCaptainComputedStats(farhad, 15, 1);
    expect(farhadStats.primaryBonusLabel).toBe('Bônus vs Monstros');
    expect(farhadStats.primaryBonusFormatted).toBe('+36.8% vs Monstros');

    // Crypts specialty (Carter)
    const carterStats = getCaptainComputedStats(carter, 30, 1);
    expect(carterStats.primaryBonusLabel).toBe('Redução de Alcatrão');
    expect(carterStats.primaryBonusFormatted).toContain('Criptas');

    // Speed specialty (Tengel)
    const tengelStats = getCaptainComputedStats(tengel, 20, 1);
    expect(tengelStats.primaryBonusLabel).toBe('Velocidade de Marcha');
    expect(tengelStats.primaryBonusFormatted).toContain('Velocidade');
  });

  it('calculates Hero stats correctly', () => {
    // Hero Attack: level * 2.5%
    expect(getHeroAttackBonus(1)).toBe(2.5);
    expect(getHeroAttackBonus(23)).toBe(57.5);
    expect(getHeroAttackBonus(50)).toBe(125.0);

    // Hero Leadership: 15000 + (level - 1) * 500
    expect(getHeroLeadershipBonus(1)).toBe(15000);
    expect(getHeroLeadershipBonus(23)).toBe(26000);
  });
});
