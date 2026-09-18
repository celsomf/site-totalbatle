import { TroopUnit, PlayerProfile, EnemySquadUnit, CombatRoundStep, SquadCasualty, CombatSimulationResult, Captain, MonsterTarget } from '../types';
import { MonsterPresetTemplate, buildMonsterTargetFromTemplate } from '../data/monsters';

export interface DispatchedTroop {
  id: string;
  name: string;
  tier: number;
  troopClass: 'melee' | 'ranged' | 'mounted' | 'flying' | 'siege';
  isMercenary?: boolean;
  count: number;
  unitAttack: number;
  unitHealth: number;
}

export function simulateCombat(
  dispatchedTroops: DispatchedTroop[],
  enemySquads: EnemySquadUnit[]
): CombatSimulationResult {
  // Deep clone squads for simulation state
  const playerSquads = dispatchedTroops
    .filter((t) => t.count > 0)
    .map((t) => ({
      ...t,
      currentCount: t.count,
      initialCount: t.count,
    }));

  const enemies = enemySquads
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      currentCount: s.count,
      initialCount: s.count,
    }));

  const initialEnemyHp = enemies.reduce((sum, e) => sum + e.unitHealth * e.initialCount, 0);
  const rounds: CombatRoundStep[] = [];
  let stepIndex = 1;
  let totalPlayerDamage = 0;
  let totalEnemyDamage = 0;

  // Maximum rounds safety limit
  let currentRound = 1;
  const MAX_ROUNDS = 10;

  while (currentRound <= MAX_ROUNDS) {
    const alivePlayers = playerSquads.filter((p) => p.currentCount > 0);
    const aliveEnemies = enemies.filter((e) => e.currentCount > 0);

    if (alivePlayers.length === 0 || aliveEnemies.length === 0) {
      break;
    }

    // --- PHASE 1: PLAYER SQUADS ATTACK ---
    // Priority order: Mercenaries (T5) -> G2 -> G1
    const sortedPlayers = [...alivePlayers].sort((a, b) => {
      if (a.isMercenary && !b.isMercenary) return -1;
      if (!a.isMercenary && b.isMercenary) return 1;
      return b.tier - a.tier;
    });

    for (const pSquad of sortedPlayers) {
      if (pSquad.currentCount <= 0) continue;

      // Target highest threat enemy alive (by unit attack * count or primary squad)
      const targetEnemy = [...enemies]
        .filter((e) => e.currentCount > 0)
        .sort((a, b) => (b.unitAttack * b.currentCount) - (a.unitAttack * a.currentCount))[0];

      if (!targetEnemy) break;

      const damage = Math.round(pSquad.currentCount * pSquad.unitAttack);
      totalPlayerDamage += damage;

      const casualties = Math.min(
        targetEnemy.currentCount,
        Math.max(1, Math.floor(damage / targetEnemy.unitHealth))
      );

      targetEnemy.currentCount = Math.max(0, targetEnemy.currentCount - casualties);

      rounds.push({
        step: stepIndex++,
        attackerName: pSquad.name,
        attackerTier: pSquad.tier,
        attackerCount: pSquad.currentCount,
        defenderName: targetEnemy.name,
        defenderTier: targetEnemy.tier,
        damageDealt: damage,
        casualties,
        defenderRemainingCount: targetEnemy.currentCount,
        isEnemyAttacking: false,
      });

      if (enemies.every((e) => e.currentCount <= 0)) {
        break;
      }
    }

    // Check if all enemies were wiped out before enemy retaliation
    if (enemies.every((e) => e.currentCount <= 0)) {
      break;
    }

    // --- PHASE 2: ENEMY SQUADS RETALIATE ---
    const sortedEnemies = [...enemies]
      .filter((e) => e.currentCount > 0)
      .sort((a, b) => b.tier - a.tier || b.initiative - a.initiative);

    for (const eSquad of sortedEnemies) {
      if (eSquad.currentCount <= 0) continue;

      const alivePlayerTargets = playerSquads.filter((p) => p.currentCount > 0);
      if (alivePlayerTargets.length === 0) break;

      // Enemy targeting logic:
      // If enemy has aspect bonus against a specific class, prefers that class;
      // otherwise, attacks G1 (bucha) first if present, then G2, then Mercenaries
      let targetPlayer = alivePlayerTargets.find((p) => {
        if (eSquad.aspects?.bonusVsMeleePercent && p.troopClass === 'melee' && p.tier === 1) return true;
        if (eSquad.aspects?.bonusVsMountedPercent && p.troopClass === 'mounted') return true;
        return false;
      });

      if (!targetPlayer) {
        // Attack lowest tier first (bucha / front-line absorption)
        targetPlayer = [...alivePlayerTargets].sort((a, b) => a.tier - b.tier)[0];
      }

      // Calculate aspect multiplier
      let multiplier = 1;
      let bonusText = '';
      if (targetPlayer.troopClass === 'melee' && eSquad.aspects?.bonusVsMeleePercent) {
        multiplier += eSquad.aspects.bonusVsMeleePercent / 100;
        bonusText = `+${eSquad.aspects.bonusVsMeleePercent}% vs Melee`;
      } else if (targetPlayer.troopClass === 'mounted' && eSquad.aspects?.bonusVsMountedPercent) {
        multiplier += eSquad.aspects.bonusVsMountedPercent / 100;
        bonusText = `+${eSquad.aspects.bonusVsMountedPercent}% vs Montadas`;
      }

      const damage = Math.round(eSquad.currentCount * eSquad.unitAttack * multiplier);
      totalEnemyDamage += damage;

      const casualties = Math.min(
        targetPlayer.currentCount,
        Math.max(1, Math.floor(damage / targetPlayer.unitHealth))
      );

      targetPlayer.currentCount = Math.max(0, targetPlayer.currentCount - casualties);

      rounds.push({
        step: stepIndex++,
        attackerName: eSquad.name,
        attackerTier: eSquad.tier,
        attackerCount: eSquad.currentCount,
        defenderName: targetPlayer.name,
        defenderTier: targetPlayer.tier,
        damageDealt: damage,
        casualties,
        defenderRemainingCount: targetPlayer.currentCount,
        isEnemyAttacking: true,
        bonusText,
      });

      if (playerSquads.every((p) => p.currentCount <= 0)) {
        break;
      }
    }

    currentRound++;
  }

  // Calculate results
  const allEnemiesDead = enemies.every((e) => e.currentCount <= 0);
  const allPlayersDead = playerSquads.every((p) => p.currentCount <= 0);
  const outcome: 'VICTORY' | 'DEFEAT' = allEnemiesDead ? 'VICTORY' : 'DEFEAT';

  const playerCasualties: SquadCasualty[] = playerSquads.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    isMercenary: p.isMercenary,
    initialCount: p.initialCount,
    lostCount: p.initialCount - p.currentCount,
    survivingCount: p.currentCount,
  }));

  const enemyCasualties: SquadCasualty[] = enemies.map((e) => ({
    id: e.id,
    name: e.name,
    tier: e.tier,
    initialCount: e.initialCount,
    lostCount: e.initialCount - e.currentCount,
    survivingCount: e.currentCount,
  }));

  const remainingEnemyHp = enemies.reduce((sum, e) => sum + e.unitHealth * e.currentCount, 0);

  // Safety level classification
  let safetyLevel: 'CLEAN_VICTORY' | 'PROTECTED_VICTORY' | 'COSTLY_VICTORY' | 'DEFEAT' = 'DEFEAT';

  if (outcome === 'VICTORY') {
    const lostT2Plus = playerCasualties.some((p) => p.tier >= 2 && p.lostCount > 0);
    const lostG1 = playerCasualties.some((p) => p.tier === 1 && p.lostCount > 0);

    if (!lostT2Plus && !lostG1) {
      safetyLevel = 'CLEAN_VICTORY';
    } else if (!lostT2Plus && lostG1) {
      safetyLevel = 'PROTECTED_VICTORY';
    } else {
      safetyLevel = 'COSTLY_VICTORY';
    }
  }

  // Calculate deficit damage & troops requirement if DEFEAT
  let deficitDamage: number | undefined;
  let deficitTroopsText: string | undefined;
  let recommendedTroopsNeeded: { troopId: string; troopName: string; countNeeded: number }[] | undefined;

  if (outcome === 'DEFEAT') {
    deficitDamage = remainingEnemyHp;

    // Estimate needed G2 Ranged or G2 Melee
    // A buffed G2 deals approx 180-220 damage
    const estimatedG2RangedDamage = 220;
    const extraG2Needed = Math.ceil(deficitDamage / estimatedG2RangedDamage);
    const extraG1BuchaNeeded = Math.ceil(totalEnemyDamage / 188); // 188 HP per G1

    deficitTroopsText = `Faltam aproximadamente ${extraG2Needed.toLocaleString('pt-BR')} Arqueiros G2 de Dano e ${extraG1BuchaNeeded.toLocaleString('pt-BR')} Lanceiros G1 de Bucha para vencer.`;
    recommendedTroopsNeeded = [
      {
        troopId: 'g2_ranged',
        troopName: 'Arqueiro de Linha (G2)',
        countNeeded: extraG2Needed,
      },
      {
        troopId: 'g1_melee',
        troopName: 'Lanceiro Recruta (G1 Bucha)',
        countNeeded: extraG1BuchaNeeded,
      },
    ];
  }

  return {
    outcome,
    safetyLevel,
    totalPlayerDamage,
    totalEnemyDamage,
    initialEnemyHp,
    remainingEnemyHp,
    playerCasualties,
    enemyCasualties,
    rounds,
    deficitDamage,
    deficitTroopsText,
    recommendedTroopsNeeded,
  };
}

/**
 * Constrói a lista de tropas enviadas na marcha com base no estoque real do jogador,
 * respeitando os limites de marcha do monstro e aplicando bônus de dragão, academia e capitão.
 */
export function buildDispatchedTroops(
  troops: TroopUnit[],
  profile: PlayerProfile,
  targetMonster: MonsterTarget,
  captain: Captain,
  sendDragon: boolean
): DispatchedTroop[] {
  const isRare = targetMonster.attackMode === 'rare';
  const isCommon = targetMonster.attackMode === 'common';

  const activeCaptainLevel = profile.captainLevels?.[captain.id] || captain.level || 1;
  const captainBonusPercent = Math.round(
    (captain.monsterAttackBonusPercent || 20) + (activeCaptainLevel * 1.2)
  );
  const dragonBonusPercent = sendDragon ? 15 : 0;
  const academyBonusPercent = profile.academyBonus?.guardsmenAttack || 25;

  const maxGuards = targetMonster.marchCapacities?.guards || (isRare ? 5250 : isCommon ? 2000 : profile.maxMarchCapacity || 3125);
  const maxMercs = targetMonster.marchCapacities?.mercenaries || (isRare ? 2520 : isCommon ? 1000 : profile.mercenaryCapacity || 1540);

  const activeMercenary = troops.find(
    (t) => t.category === 'mercenary' && t.isUnlocked && t.ownedCount > 0
  ) || troops.find((t) => t.id === 'epic_monster_hunter_v');

  const mercRecommended = activeMercenary
    ? Math.min(activeMercenary.ownedCount, maxMercs)
    : 0;

  const weakness = targetMonster.weaknessClasses || ['ranged'];
  const prefersRanged = weakness.includes('ranged');
  const prefersMelee = weakness.includes('melee');

  const g2Ranged = troops.find((t) => t.id === 'g2_ranged');
  const g1Ranged = troops.find((t) => t.id === 'g1_ranged');
  const g2Melee = troops.find((t) => t.id === 'g2_melee');
  const g1Melee = troops.find((t) => t.id === 'g1_melee');

  let g2RangedRec = 0;
  let g1RangedRec = 0;
  let g1MeleeRec = 0;
  let g2MeleeRec = 0;
  let allocatedGuards = 0;

  if (prefersRanged) {
    g2RangedRec = Math.min(g2Ranged?.ownedCount || 0, maxGuards - 100);
    allocatedGuards += g2RangedRec;

    if (maxGuards - allocatedGuards > 50) {
      g1RangedRec = Math.min(g1Ranged?.ownedCount || 0, maxGuards - allocatedGuards - 50);
      allocatedGuards += g1RangedRec;
    }

    g1MeleeRec = Math.min(g1Melee?.ownedCount || 0, maxGuards - allocatedGuards);
    allocatedGuards += g1MeleeRec;
  } else if (prefersMelee) {
    g2MeleeRec = Math.min(g2Melee?.ownedCount || 0, maxGuards - 100);
    allocatedGuards += g2MeleeRec;

    g1MeleeRec = Math.min(g1Melee?.ownedCount || 0, maxGuards - allocatedGuards);
    allocatedGuards += g1MeleeRec;
  } else {
    g2RangedRec = Math.min(g2Ranged?.ownedCount || 0, Math.floor((maxGuards - 100) / 2));
    allocatedGuards += g2RangedRec;

    g2MeleeRec = Math.min(g2Melee?.ownedCount || 0, Math.floor((maxGuards - allocatedGuards) / 2));
    allocatedGuards += g2MeleeRec;

    g1MeleeRec = Math.min(g1Melee?.ownedCount || 0, maxGuards - allocatedGuards);
    allocatedGuards += g1MeleeRec;
  }

  const dispatchedTroopsList: DispatchedTroop[] = [];

  if (activeMercenary && mercRecommended > 0) {
    dispatchedTroopsList.push({
      id: activeMercenary.id,
      name: activeMercenary.name,
      tier: activeMercenary.tier,
      troopClass: activeMercenary.troopClass,
      isMercenary: true,
      count: mercRecommended,
      unitAttack: Math.round(
        (activeMercenary.customAttack || activeMercenary.baseAttack) *
          (1 + (dragonBonusPercent + (profile.academyBonus?.monstersAttack || 20) + (captain.specialty === 'monsters' ? captainBonusPercent : 0)) / 100)
      ),
      unitHealth: Math.round(
        (activeMercenary.customHealth || activeMercenary.baseHealth) *
          (1 + (profile.academyBonus?.monstersHealth || 40) / 100)
      ),
    });
  }

  if (g2Ranged && g2RangedRec > 0) {
    dispatchedTroopsList.push({
      id: g2Ranged.id,
      name: g2Ranged.name,
      tier: 2,
      troopClass: 'ranged',
      isMercenary: false,
      count: g2RangedRec,
      unitAttack: Math.round(
        (g2Ranged.customAttack || g2Ranged.baseAttack) *
          (1 + (captainBonusPercent + dragonBonusPercent + academyBonusPercent) / 100)
      ),
      unitHealth: Math.round(
        (g2Ranged.customHealth || g2Ranged.baseHealth) *
          (1 + (profile.academyBonus?.guardsmenHealth || 25.5) / 100)
      ),
    });
  }

  if (g2Melee && g2MeleeRec > 0) {
    dispatchedTroopsList.push({
      id: g2Melee.id,
      name: g2Melee.name,
      tier: 2,
      troopClass: 'melee',
      isMercenary: false,
      count: g2MeleeRec,
      unitAttack: Math.round(
        (g2Melee.customAttack || g2Melee.baseAttack) *
          (1 + (captainBonusPercent + dragonBonusPercent + academyBonusPercent) / 100)
      ),
      unitHealth: Math.round(
        (g2Melee.customHealth || g2Melee.baseHealth) *
          (1 + (profile.academyBonus?.guardsmenHealth || 25.5) / 100)
      ),
    });
  }

  if (g1Ranged && g1RangedRec > 0) {
    dispatchedTroopsList.push({
      id: g1Ranged.id,
      name: g1Ranged.name,
      tier: 1,
      troopClass: 'ranged',
      isMercenary: false,
      count: g1RangedRec,
      unitAttack: Math.round(
        (g1Ranged.customAttack || g1Ranged.baseAttack) *
          (1 + (captainBonusPercent + dragonBonusPercent + academyBonusPercent) / 100)
      ),
      unitHealth: Math.round(
        (g1Ranged.customHealth || g1Ranged.baseHealth) *
          (1 + (profile.academyBonus?.guardsmenHealth || 25.5) / 100)
      ),
    });
  }

  if (g1Melee && g1MeleeRec > 0) {
    dispatchedTroopsList.push({
      id: g1Melee.id,
      name: g1Melee.name,
      tier: 1,
      troopClass: 'melee',
      isMercenary: false,
      count: g1MeleeRec,
      unitAttack: Math.round(
        (g1Melee.customAttack || g1Melee.baseAttack) *
          (1 + (captainBonusPercent + dragonBonusPercent + academyBonusPercent) / 100)
      ),
      unitHealth: Math.round(
        (g1Melee.customHealth || g1Melee.baseHealth) *
          (1 + (profile.academyBonus?.guardsmenHealth || 25.5) / 100)
      ),
    });
  }

  return dispatchedTroopsList;
}

/**
 * Encontra o nível ótimo para farmar XP e subir de nível mais rápido:
 * O nível mais alto do monstro que o exército atual do jogador vence com segurança (sem perdas nobres).
 */
export function findOptimalFarmLevel(
  template: MonsterPresetTemplate,
  troops: TroopUnit[],
  profile: PlayerProfile,
  captain: Captain,
  sendDragon: boolean = true
): {
  optimalLevel: number;
  optimalXp: number;
  isSafe: boolean;
  canBeatAnyLevel: boolean;
} {
  const levels = [...(template.availableLevels || [template.defaultLevel])].sort((a, b) => b - a);

  let bestLevel = levels[levels.length - 1];
  let bestXp = 0;
  let foundSafe = false;

  for (const lvl of levels) {
    const target = buildMonsterTargetFromTemplate(template, lvl);
    const dispatched = buildDispatchedTroops(troops, profile, target, captain, sendDragon);
    const sim = simulateCombat(dispatched, target.enemySquads || []);

    if (sim.outcome !== 'DEFEAT') {
      bestLevel = lvl;
      bestXp = target.xpReward || 0;
      foundSafe = true;
      break;
    }
  }

  return {
    optimalLevel: bestLevel,
    optimalXp: bestXp,
    isSafe: foundSafe,
    canBeatAnyLevel: foundSafe,
  };
}

