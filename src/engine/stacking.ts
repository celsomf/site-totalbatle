import { TroopUnit, MonsterTarget, Captain, PlayerProfile, MarchSquadAllocation, MarchRecommendation } from '../types';
import { getCaptainMonsterAttackBonus } from '../utils/captainStats';

/**
 * Calculates 2n+1 fodder squads to absorb first strikes from an Epic or Common monster,
 * taking troops strictly from the player's available stock (ownedCount).
 */
export function calculateFodderStacks(
  troops: TroopUnit[],
  target: MonsterTarget
): MarchSquadAllocation[] {
  const available = troops.filter((t) => t.isUnlocked && t.ownedCount > 0);
  if (available.length === 0) return [];

  // Find lowest tier available unit with stock for sacrificial fodder (G1 or G2 preferred)
  const fodderUnit = available.reduce((lowest, current) => {
    if (current.tier < lowest.tier) return current;
    if (current.tier === lowest.tier && current.revivalSilverCost < lowest.revivalSilverCost) return current;
    return lowest;
  }, available[0]);

  // For Epic Monsters: rule of 2n + 1 where n is the number of monster squads
  const numberOfStacks = target.type === 'epic_monster' ? (target.squadCount * 2 + 1) : Math.max(2, target.squadCount * 2);

  // Each fodder stack gets 15-30 units, limited by total owned stock divided across stacks
  const idealPerStack = Math.max(10, Math.min(35, Math.ceil(target.baseAttack / (fodderUnit.customHealth || fodderUnit.baseHealth || 100) / 4)));
  const maxAffordablePerStack = Math.max(1, Math.floor(fodderUnit.ownedCount / numberOfStacks));
  const fodderPerStack = Math.min(idealPerStack, maxAffordablePerStack);

  const fodderSquads: MarchSquadAllocation[] = [];
  for (let i = 0; i < numberOfStacks; i++) {
    const health = (fodderUnit.customHealth || fodderUnit.baseHealth) * fodderPerStack;
    const attack = (fodderUnit.customAttack || fodderUnit.baseAttack) * fodderPerStack;
    fodderSquads.push({
      unitId: `${fodderUnit.id}_stack_${i + 1}`,
      unitName: `${fodderUnit.name} [Fodder #${i + 1}]`,
      tier: fodderUnit.tier,
      category: fodderUnit.category,
      troopClass: fodderUnit.troopClass,
      count: fodderPerStack,
      role: 'fodder',
      totalSquadHealth: health,
      totalSquadAttack: attack,
      expectedLosses: fodderPerStack,
    });
  }

  return fodderSquads;
}

/**
 * Allocates primary and secondary damage squads based on monster weaknesses,
 * taking units strictly from the player's stock (ownedCount) and respecting march capacity.
 */
export function allocateMarchSquads(
  profile: PlayerProfile,
  troops: TroopUnit[],
  captain: Captain,
  target: MonsterTarget
): MarchRecommendation {
  const available = troops.filter((t) => t.isUnlocked && t.ownedCount > 0);
  const fodderSquads = calculateFodderStacks(troops, target);
  const totalFodderCount = fodderSquads.reduce((sum, s) => sum + s.count, 0);

  // Remaining capacity for primary & secondary damage dealers
  const maxCapacity = target.marchCapacities?.guards || profile.maxMarchCapacity || 3125;
  const availableDamageCapacity = Math.max(0, maxCapacity - totalFodderCount);

  // Find best damage units matching weakness or highest tier with stock
  const damageCandidates = available.filter((t) => t.tier >= 2 || available.length <= 2);
  const weaknessUnits = damageCandidates.filter((t) => target.weaknessClasses.includes(t.troopClass));

  let primaryUnit = weaknessUnits.length > 0
    ? weaknessUnits.reduce((prev, curr) => (curr.tier > prev.tier ? curr : prev), weaknessUnits[0])
    : damageCandidates.reduce((prev, curr) => (curr.tier > prev.tier ? curr : prev), damageCandidates[0] || available[0]);

  if (!primaryUnit && available.length > 0) {
    primaryUnit = available[0];
  }

  const squads: MarchSquadAllocation[] = [...fodderSquads];

  if (primaryUnit && availableDamageCapacity > 0) {
    const unitAttack = primaryUnit.customAttack || primaryUnit.baseAttack;
    const unitHealth = primaryUnit.customHealth || primaryUnit.baseHealth;

    // Apply Captain monster bonus, Dragão bonus & Academy bonus
    const captainLevel = profile.captainLevels[captain?.id] || captain?.level || 1;
    const captainStars = profile.captainStars?.[captain?.id] || captain?.stars || 1;
    const captainBonus = captain
      ? getCaptainMonsterAttackBonus(captain, captainLevel, captainStars) / 100
      : 0;
    const dragonBonus = (profile.dragonLevel || 15) * 0.01; // +15% at dragon lvl 15
    const academyCategoryBonus = primaryUnit.category === 'guardsman'
      ? (profile.academyBonus.guardsmenAttack || 0) / 100
      : primaryUnit.category === 'specialist'
      ? (profile.academyBonus.specialistsAttack || 0) / 100
      : (profile.academyBonus.monstersAttack || 0) / 100;

    const weaknessMultiplier = target.weaknessClasses.includes(primaryUnit.troopClass) ? 1.5 : 1.0;
    const totalMultiplier = (1 + captainBonus + dragonBonus + academyCategoryBonus) * weaknessMultiplier;

    const effectiveAttack = Math.round(unitAttack * totalMultiplier);

    // Count cannot exceed player's actual stock (ownedCount) nor march capacity
    const neededCount = Math.ceil((target.customHealthOverride || target.totalHealth) / effectiveAttack);
    const maxUsableFromStock = Math.min(primaryUnit.ownedCount, availableDamageCapacity);
    const allocatedCount = Math.min(maxUsableFromStock, neededCount);

    squads.push({
      unitId: primaryUnit.id,
      unitName: `${primaryUnit.name} [Núcleo de Dano]`,
      tier: primaryUnit.tier,
      category: primaryUnit.category,
      troopClass: primaryUnit.troopClass,
      count: allocatedCount,
      role: 'primary_damage',
      totalSquadHealth: unitHealth * allocatedCount,
      totalSquadAttack: effectiveAttack * allocatedCount,
      expectedLosses: 0, // Fodder absorbs initial strikes
    });
  }

  const totalMarchSize = squads.reduce((sum, s) => sum + s.count, 0);
  const capacityUtilizationPercent = maxCapacity > 0 ? Math.min(100, Math.round((totalMarchSize / maxCapacity) * 100)) : 100;
  const exceedsCapacity = totalMarchSize > maxCapacity;

  // Calculate projected rewards
  const captainLevel = profile.captainLevels[captain?.id] || captain?.level || 1;
  const projectedVP = Math.round(target.estimatedValorPoints * (1 + (captainLevel * 0.01)));
  const projectedCP = target.estimatedChestPoints;
  const projectedCaptainXP = Math.round(target.estimatedCaptainXP * (1 + (captainLevel * 0.015)));

  // Temple revival silver for lost fodder
  const totalFodderRevivalSilver = fodderSquads.reduce((sum, s) => {
    const unit = troops.find((t) => t.id === s.unitId.split('_stack_')[0]);
    return sum + (s.expectedLosses * (unit?.revivalSilverCost || 15));
  }, 0);

  const tacticalNotes: string[] = [];
  if (target.weaknessClasses.length > 0) {
    tacticalNotes.push(`Fraqueza do Alvo: ${target.weaknessClasses.join(', ').toUpperCase()} (+50% bônus de dano).`);
  }
  if (fodderSquads.length > 0) {
    tacticalNotes.push(`Blindagem Ativa: ${fodderSquads.length} esquadrões de bucha absorvem os ataques de maior HP inicial.`);
  }
  if (exceedsCapacity) {
    tacticalNotes.push(`Atenção: A marcha ideal excede o limite de ${maxCapacity.toLocaleString('pt-BR')} tropas.`);
  }

  const squadAllocationsMap: Record<string, number> = {};
  for (const sq of squads) {
    squadAllocationsMap[sq.unitId] = (squadAllocationsMap[sq.unitId] || 0) + sq.count;
  }

  const mercUnit = troops.find((t) => t.category === 'monster' && t.tier === 5);
  const mercenarySize = Math.min(mercUnit?.ownedCount || 81, profile.mercenaryCapacity || 1540);
  const mercenaryCapacity = profile.mercenaryCapacity || 1540;

  return {
    targetId: target.id,
    targetName: target.name,
    targetLevel: target.level,
    captainName: captain?.name || 'Herói Padrão',
    squads,
    squadAllocationsMap,
    totalMarchSize,
    mercenarySize,
    mercenaryCapacity,
    maxCapacity,
    capacityUtilizationPercent,
    exceedsCapacity,
    expectedCombatRounds: 2,
    expectedVictoryProbability: exceedsCapacity ? 0.85 : 1.0,
    projectedValorPoints: projectedVP,
    projectedChestPoints: projectedCP,
    projectedCaptainXP: projectedCaptainXP,
    estimatedTempleRevivalSilver: totalFodderRevivalSilver,
    tacticalNotes,
  };
}
