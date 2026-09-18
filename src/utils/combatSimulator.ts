import { TroopUnit, PlayerProfile, EnemySquadUnit, CombatRoundStep, SquadCasualty, CombatSimulationResult } from '../types';

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
