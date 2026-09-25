import { Captain } from '../types';

export interface CaptainComputedBonus {
  monsterAttackBonusPercent: number;
  marchSpeedBonusPercent: number;
  cryptTarReductionPercent: number;
  primaryBonusLabel: string;
  primaryBonusFormatted: string;
  primaryBonusColor: string;
}

/**
 * Calcula o bônus efetivo de ataque contra monstros considerando nível e estrelas (1★ a 6★).
 * Base + (Nível - 1) * 1.2% + (Estrelas - 1) * 5.0%
 */
export function getCaptainMonsterAttackBonus(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): number {
  const base = captain.monsterAttackBonusPercent || 0;
  const safeLevel = Math.max(1, level);
  const safeStars = Math.max(1, Math.min(6, stars));
  const levelBonus = (safeLevel - 1) * 1.2;
  const starsBonus = (safeStars - 1) * 5.0;

  return Number((base + levelBonus + starsBonus).toFixed(1));
}

/**
 * Calcula o bônus de velocidade de marcha considerando nível e estrelas.
 */
export function getCaptainSpeedBonus(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): number {
  const base = captain.marchSpeedBonusPercent || 0;
  const safeLevel = Math.max(1, level);
  const safeStars = Math.max(1, Math.min(6, stars));
  const levelBonus = (safeLevel - 1) * 0.5;
  const starsBonus = (safeStars - 1) * 2.0;

  return Number((base + levelBonus + starsBonus).toFixed(1));
}

/**
 * Calcula o bônus de redução de alcatrão em criptas considerando nível e estrelas.
 */
export function getCaptainCryptTarReduction(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): number {
  const base = captain.cryptTarReductionPercent || 0;
  const safeLevel = Math.max(1, level);
  const safeStars = Math.max(1, Math.min(6, stars));
  const levelBonus = (safeLevel - 1) * 0.4;
  const starsBonus = (safeStars - 1) * 2.0;

  return Number((base + levelBonus + starsBonus).toFixed(1));
}

/**
 * Retorna o resumo completo de bônus e formatação para UI e Simulador.
 */
export function getCaptainComputedStats(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): CaptainComputedBonus {
  const monsterBonus = getCaptainMonsterAttackBonus(captain, level, stars);
  const speedBonus = getCaptainSpeedBonus(captain, level, stars);
  const tarReduction = getCaptainCryptTarReduction(captain, level, stars);

  let primaryLabel = 'Bônus vs Monstros';
  let primaryFormatted = `+${monsterBonus.toFixed(1)}% vs Monstros`;
  let primaryColor = 'text-emerald-400';

  switch (captain.specialty) {
    case 'crypts':
      primaryLabel = 'Redução de Alcatrão';
      primaryFormatted = `-${tarReduction.toFixed(1)}% Criptas`;
      primaryColor = 'text-cyan-400';
      break;
    case 'speed':
      primaryLabel = 'Velocidade de Marcha';
      primaryFormatted = `+${speedBonus.toFixed(1)}% Velocidade`;
      primaryColor = 'text-amber-400';
      break;
    case 'pvp':
      primaryLabel = 'Bônus de Combate';
      primaryFormatted = `+${monsterBonus.toFixed(1)}% Combate`;
      primaryColor = 'text-rose-400';
      break;
    case 'economy':
      primaryLabel = 'Bônus de Marcha/Expedição';
      primaryFormatted = `+${monsterBonus.toFixed(1)}% Marcha`;
      primaryColor = 'text-indigo-400';
      break;
    case 'monsters':
    default:
      primaryLabel = 'Bônus vs Monstros';
      primaryFormatted = `+${monsterBonus.toFixed(1)}% vs Monstros`;
      primaryColor = 'text-emerald-400';
      break;
  }

  return {
    monsterAttackBonusPercent: monsterBonus,
    marchSpeedBonusPercent: speedBonus,
    cryptTarReductionPercent: tarReduction,
    primaryBonusLabel: primaryLabel,
    primaryBonusFormatted: primaryFormatted,
    primaryBonusColor: primaryColor,
  };
}

/**
 * Calcula o bônus de ataque geral fornecido pelo Herói Supremo.
 */
export function getHeroAttackBonus(heroLevel: number = 1): number {
  const safeLevel = Math.max(1, heroLevel);
  return Number((safeLevel * 2.5).toFixed(1));
}

/**
 * Calcula a liderança base concedida pelo Herói Supremo.
 */
export function getHeroLeadershipBonus(heroLevel: number = 1): number {
  const safeLevel = Math.max(1, heroLevel);
  return 15000 + (safeLevel - 1) * 500;
}
