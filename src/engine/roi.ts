import { MonsterTarget, Captain } from '../types';

export interface BattleROI {
  projectedValorPoints: number;
  projectedChestPoints: number;
  projectedCaptainXP: number;
  templeSilverCost: number;
  vpPerSilverSpent: number;
  efficiencyRating: 'EXCELENTE' | 'BOM' | 'MODERADO' | 'BAIXO';
}

/**
 * Calculates return on investment (VP/CP/XP per silver spent).
 */
export function calculateBattleROI(
  target: MonsterTarget,
  captain: Captain,
  captainLevel: number,
  totalFodderLosses: number,
  averageRevivalCostPerFodder: number = 15
): BattleROI {
  const vpBonusMultiplier = 1 + (captainLevel * 0.01);
  const xpBonusMultiplier = 1 + (captainLevel * 0.015);

  const projectedValorPoints = Math.round(target.estimatedValorPoints * vpBonusMultiplier);
  const projectedChestPoints = target.estimatedChestPoints;
  const projectedCaptainXP = Math.round(target.estimatedCaptainXP * xpBonusMultiplier);

  const templeSilverCost = totalFodderLosses * averageRevivalCostPerFodder;
  const vpPerSilverSpent = templeSilverCost > 0 ? Math.round(projectedValorPoints / templeSilverCost) : projectedValorPoints;

  let efficiencyRating: BattleROI['efficiencyRating'] = 'BOM';
  if (vpPerSilverSpent > 30) efficiencyRating = 'EXCELENTE';
  else if (vpPerSilverSpent > 15) efficiencyRating = 'BOM';
  else if (vpPerSilverSpent > 5) efficiencyRating = 'MODERADO';
  else efficiencyRating = 'BAIXO';

  return {
    projectedValorPoints,
    projectedChestPoints,
    projectedCaptainXP,
    templeSilverCost,
    vpPerSilverSpent,
    efficiencyRating,
  };
}
