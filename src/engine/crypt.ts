import { TroopUnit, Captain, PlayerProfile, CryptRecommendation, MarchSquadAllocation } from '../types';
import { DEFAULT_MONSTERS } from '../data/monsters';

/**
 * Calculates the required attack power and optimal troops to 1-hit KO (one-shot) a crypt.
 */
export function calculateCryptOneShot(
  profile: PlayerProfile,
  troops: TroopUnit[],
  captain: Captain,
  cryptLevel: number
): CryptRecommendation {
  const crypt = DEFAULT_MONSTERS.find((m) => m.type === 'crypt' && m.level === cryptLevel) || {
    id: `crypt_${cryptLevel}`,
    name: `Cripta Nível ${cryptLevel}`,
    type: 'crypt' as const,
    level: cryptLevel,
    totalHealth: cryptLevel * cryptLevel * 1400 + 5000,
    baseAttack: cryptLevel * 1500,
    squadCount: 1,
    weaknessClasses: ['melee', 'ranged', 'mounted'],
    estimatedValorPoints: cryptLevel * 2500,
    estimatedChestPoints: cryptLevel * 8,
    estimatedCaptainXP: cryptLevel * 3000,
  };

  const unlocked = troops.filter((t) => t.isUnlocked);
  const maxCapacity = profile.maxMarchCapacity || 65000;

  // Base tar cost scales with crypt level: Level 5 = 20, Level 15 = 60, Level 30 = 120
  const baseTar = Math.round(cryptLevel * 4);
  const captainTarDiscount = (captain?.cryptTarReductionPercent || 0) / 100;
  const tarCost = Math.max(5, Math.round(baseTar * (1 - captainTarDiscount)));

  // Required attack power to defeat crypt health in 1 hit
  const requiredAttackPower = crypt.totalHealth;

  if (unlocked.length === 0) {
    return {
      canOneShot: false,
      cryptLevel,
      requiredAttackPower,
      recommendedSquads: [],
      totalMarchSize: 0,
      tarCost,
      projectedForgingMaterials: cryptLevel * 5,
      warningMessage: 'Nenhuma tropa desbloqueada no seu perfil.',
    };
  }

  // Find best troop (highest attack per leadership point)
  const bestTroop = unlocked.reduce((prev, curr) => {
    const prevAtk = (prev.customAttack || prev.baseAttack) / (prev.leadershipCost || 1);
    const currAtk = (curr.customAttack || curr.baseAttack) / (curr.leadershipCost || 1);
    return currAtk > prevAtk ? curr : prev;
  }, unlocked[0]);

  const unitAttack = bestTroop.customAttack || bestTroop.baseAttack;
  const unitHealth = bestTroop.customHealth || bestTroop.baseHealth;

  const academyBonus = bestTroop.category === 'guardsman'
    ? (profile.academyBonus.guardsmenAttack || 0) / 100
    : bestTroop.category === 'specialist'
    ? (profile.academyBonus.specialistsAttack || 0) / 100
    : (profile.academyBonus.monstersAttack || 0) / 100;

  const effectiveUnitAttack = Math.round(unitAttack * (1 + academyBonus));
  const neededCount = Math.ceil(requiredAttackPower / effectiveUnitAttack);
  const canOneShot = neededCount <= maxCapacity;
  const allocatedCount = Math.min(maxCapacity, neededCount);

  const recommendedSquads: MarchSquadAllocation[] = [
    {
      unitId: bestTroop.id,
      unitName: `${bestTroop.name} [Dano Concentrado One-Shot]`,
      tier: bestTroop.tier,
      category: bestTroop.category,
      troopClass: bestTroop.troopClass,
      count: allocatedCount,
      role: 'primary_damage',
      totalSquadHealth: unitHealth * allocatedCount,
      totalSquadAttack: effectiveUnitAttack * allocatedCount,
      expectedLosses: 0, // In 1-hit KO, crypt dies before dealing damage
    },
  ];

  let warningMessage: string | undefined;
  if (!canOneShot) {
    warningMessage = `Sua capacidade máxima de marcha (${maxCapacity.toLocaleString('pt-BR')}) não atinge o poder de ataque necessário de ${requiredAttackPower.toLocaleString('pt-BR')}. Sugerimos Cripta Nível ${Math.max(1, cryptLevel - 5)}.`;
  }

  return {
    canOneShot,
    cryptLevel,
    requiredAttackPower,
    recommendedSquads,
    totalMarchSize: allocatedCount,
    tarCost,
    projectedForgingMaterials: cryptLevel * 8,
    warningMessage,
  };
}
