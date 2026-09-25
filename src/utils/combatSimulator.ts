import { TroopUnit, PlayerProfile, EnemySquadUnit, CombatRoundStep, SquadCasualty, CombatSimulationResult, Captain, MonsterTarget } from '../types';
import { MonsterPresetTemplate, buildMonsterTargetFromTemplate } from '../data/monsters';
import { getCaptainMonsterAttackBonus } from './captainStats';

export interface DispatchedTroop {
  id: string;
  name: string;
  tier: number;
  troopClass: 'melee' | 'ranged' | 'mounted' | 'flying' | 'siege';
  category?: 'guardsman' | 'specialist' | 'monster' | 'mercenary';
  isMercenary?: boolean;
  count: number;
  unitAttack: number;
  unitHealth: number;
  avatarIcon?: string;
}

export function calculateUnitCombatStats(
  troop: TroopUnit,
  profile: PlayerProfile,
  captain: Captain,
  captainBonusPercent: number,
  dragonBonusPercent: number
): { unitAttack: number; unitHealth: number } {
  let attackBonusPercent = captainBonusPercent + dragonBonusPercent;
  let healthBonusPercent = 0;

  if (troop.category === 'mercenary') {
    attackBonusPercent =
      dragonBonusPercent +
      (profile.academyBonus?.monstersAttack || 20) +
      (captain.specialty === 'monsters' ? captainBonusPercent : 0);
    healthBonusPercent = profile.academyBonus?.monstersHealth || 40;
  } else if (troop.category === 'guardsman') {
    attackBonusPercent += profile.academyBonus?.guardsmenAttack || 25;
    healthBonusPercent = profile.academyBonus?.guardsmenHealth || 25.5;
  } else if (troop.category === 'specialist') {
    attackBonusPercent += profile.academyBonus?.specialistsAttack || 15;
    healthBonusPercent = profile.academyBonus?.specialistsHealth || 10;
  } else if (troop.category === 'monster') {
    attackBonusPercent += profile.academyBonus?.monstersAttack || 20;
    healthBonusPercent = profile.academyBonus?.monstersHealth || 20;
  } else {
    attackBonusPercent += 20;
    healthBonusPercent = 20;
  }

  const rawAtk = troop.customAttack || troop.baseAttack || 50;
  const rawHp = troop.customHealth || troop.baseHealth || 150;

  const unitAttack = Math.round(rawAtk * (1 + attackBonusPercent / 100));
  const unitHealth = Math.round(rawHp * (1 + healthBonusPercent / 100));

  return { unitAttack, unitHealth };
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

    // --- SEQUÊNCIA DE TURNOS POR INICIATIVA E ESTRATÉGIA DO TOTAL BATTLE ---
    // 1. Mercenários do jogador de alto nível atacam primeiro com iniciativa superior
    // 2. Monstros inimigos atacam alvos prioritários
    // 3. Tropas regulares do jogador (arqueiros/lanceiros) finalizam o turno
    type CombatActor = { side: 'player' | 'enemy'; squad: any };
    const turnQueue: CombatActor[] = [];

    // Mercenários do jogador (Iniciativa mais alta)
    const playerMercs = playerSquads
      .filter((p) => p.currentCount > 0 && (p.isMercenary || p.category === 'mercenary'))
      .sort((a, b) => b.tier - a.tier || b.unitAttack - a.unitAttack);
    playerMercs.forEach((m) => turnQueue.push({ side: 'player', squad: m }));

    // Inimigos
    const sortedEnemies = enemies
      .filter((e) => e.currentCount > 0)
      .sort((a, b) => b.tier - a.tier || b.initiative - a.initiative);
    sortedEnemies.forEach((e) => turnQueue.push({ side: 'enemy', squad: e }));

    // Tropas regulares do jogador
    const playerRegulars = playerSquads
      .filter((p) => p.currentCount > 0 && !p.isMercenary && p.category !== 'mercenary')
      .sort((a, b) => b.tier - a.tier || b.unitAttack - a.unitAttack);
    playerRegulars.forEach((r) => turnQueue.push({ side: 'player', squad: r }));

    for (const actor of turnQueue) {
      if (actor.squad.currentCount <= 0) continue;

      if (actor.side === 'player') {
        const pSquad = actor.squad;
        const targetEnemy = enemies
          .filter((e) => e.currentCount > 0)
          .sort((a, b) => b.unitAttack * b.currentCount - a.unitAttack * a.currentCount)[0];

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
      } else {
        const eSquad = actor.squad;
        const alivePlayerTargets = playerSquads.filter((p) => p.currentCount > 0);
        if (alivePlayerTargets.length === 0) break;

        let targetPlayer: typeof alivePlayerTargets[0] | undefined;

        if (eSquad.troopClass === 'ranged') {
          const playerRanged = alivePlayerTargets
            .filter((p) => p.troopClass === 'ranged')
            .sort((a, b) => b.tier - a.tier || b.unitAttack * b.currentCount - a.unitAttack * a.currentCount);
          if (playerRanged.length > 0) {
            targetPlayer = playerRanged[0];
          }
        } else if (eSquad.troopClass === 'melee') {
          const playerMelee = alivePlayerTargets
            .filter((p) => p.troopClass === 'melee')
            .sort((a, b) => a.tier - b.tier);
          if (playerMelee.length > 0) {
            targetPlayer = playerMelee[0];
          }
        }

        if (!targetPlayer) {
          targetPlayer = [...alivePlayerTargets].sort((a, b) => b.isMercenary ? -1 : 1 || b.tier - a.tier)[0] || alivePlayerTargets[0];
        }

        let multiplier = 1;
        let bonusText = '';
        if (targetPlayer.troopClass === 'melee' && eSquad.aspects?.bonusVsMeleePercent) {
          multiplier += eSquad.aspects.bonusVsMeleePercent / 100;
          bonusText = `+${eSquad.aspects.bonusVsMeleePercent}% vs Melee`;
        } else if (targetPlayer.troopClass === 'mounted' && eSquad.aspects?.bonusVsMountedPercent) {
          multiplier += eSquad.aspects.bonusVsMountedPercent / 100;
          bonusText = `+${eSquad.aspects.bonusVsMountedPercent}% vs Montadas`;
        } else if (targetPlayer.troopClass === 'ranged' && eSquad.aspects?.bonusVsRangedPercent) {
          multiplier += eSquad.aspects.bonusVsRangedPercent / 100;
          bonusText = `+${eSquad.aspects.bonusVsRangedPercent}% vs Longo Alcance`;
        } else if (targetPlayer.troopClass === 'flying' && eSquad.aspects?.bonusVsFlyingPercent) {
          multiplier += eSquad.aspects.bonusVsFlyingPercent / 100;
          bonusText = `+${eSquad.aspects.bonusVsFlyingPercent}% vs Voadoras`;
        } else if (targetPlayer.troopClass === 'siege' && eSquad.aspects?.bonusVsSiegePercent) {
          multiplier += eSquad.aspects.bonusVsSiegePercent / 100;
          bonusText = `+${eSquad.aspects.bonusVsSiegePercent}% vs Armas de Cerco`;
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
    }

    currentRound++;
  }

  // Calculate results
  const allEnemiesDead = enemies.every((e) => e.currentCount <= 0);
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

    const estimatedG2RangedDamage = 220;
    const extraG2Needed = Math.ceil(deficitDamage / estimatedG2RangedDamage);
    const extraG1BuchaNeeded = Math.ceil(totalEnemyDamage / 188);

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
  const activeCaptainStars = profile.captainStars?.[captain.id] || captain.stars || 1;
  const captainBonusPercent = getCaptainMonsterAttackBonus(
    captain,
    activeCaptainLevel,
    activeCaptainStars
  );
  const dragonBonusPercent = sendDragon ? 15 : 0;

  const maxGuards =
    profile.maxMarchCapacity ||
    targetMonster.marchCapacities?.guards ||
    (isRare ? 5250 : isCommon ? 2725 : 2000);
  const maxMercs =
    profile.mercenaryCapacity ||
    targetMonster.marchCapacities?.mercenaries ||
    (isRare ? 2520 : isCommon ? 1340 : 1000);
  const maxMonsters =
    profile.specialCapacity ||
    targetMonster.marchCapacities?.monsters ||
    (isRare ? 1260 : isCommon ? 670 : 500);

  // 1. Filtrar tropas disponíveis com estoque ativo
  const availableTroops = troops.filter((t) => t.isUnlocked !== false && t.ownedCount > 0);

  const dispatchedTroopsList: DispatchedTroop[] = [];

  // 2. SLOT 2: MERCENÁRIOS (Limitado por maxMercs)
  const availableMercs = availableTroops
    .filter((t) => t.category === 'mercenary')
    .sort((a, b) => b.tier - a.tier || (b.customAttack || b.baseAttack) - (a.customAttack || a.baseAttack));

  let remainingMercCapacity = maxMercs;
  let totalMercDamage = 0;

  for (const merc of availableMercs) {
    if (remainingMercCapacity <= 0) break;
    const count = Math.min(merc.ownedCount, remainingMercCapacity);
    if (count <= 0) continue;

    const { unitAttack, unitHealth } = calculateUnitCombatStats(
      merc,
      profile,
      captain,
      captainBonusPercent,
      dragonBonusPercent
    );

    dispatchedTroopsList.push({
      id: merc.id,
      name: merc.name,
      tier: merc.tier,
      troopClass: merc.troopClass,
      category: 'mercenary',
      isMercenary: true,
      count,
      unitAttack,
      unitHealth,
      avatarIcon: merc.avatarIcon || merc.id,
    });

    totalMercDamage += count * unitAttack;
    remainingMercCapacity -= count;
  }

  // 3. Avaliar inimigos, aspectos e fraquezas
  const enemySquads = targetMonster.enemySquads || [];
  const totalEnemyHp = enemySquads.reduce((sum, s) => sum + s.unitHealth * s.count, 0);
  const enemyClasses = enemySquads.map((s) => s.troopClass);
  const hasEnemyRanged = enemyClasses.includes('ranged');
  const hasEnemyMelee = enemyClasses.includes('melee');
  const enemyHasBonusVsMounted = enemySquads.some((s) => (s.aspects?.bonusVsMountedPercent || 0) > 0);
  const enemyHasBonusVsMelee = enemySquads.some((s) => (s.aspects?.bonusVsMeleePercent || 0) > 0);
  const enemyHasBonusVsFlying = enemySquads.some((s) => (s.aspects?.bonusVsFlyingPercent || 0) > 0);
  const weaknessClasses = targetMonster.weaknessClasses || ['ranged'];

  // 4. SLOT 3: MONSTROS & ESPECIAIS (Limitado por maxMonsters e leadershipCost)
  // Penalizar classes que o inimigo tem bônus de dano contra (ex: Bárbaros punem Montadas -> evitar Javali)
  const availableMonsters = availableTroops
    .filter((t) => t.category === 'monster')
    .filter((t) => {
      if (enemyHasBonusVsMounted && t.troopClass === 'mounted') return false;
      if (enemyHasBonusVsFlying && t.troopClass === 'flying') return false;
      return true;
    })
    .sort((a, b) => {
      // 1. Fraqueza do monstro
      const aWeakness = weaknessClasses.includes(a.troopClass);
      const bWeakness = weaknessClasses.includes(b.troopClass);
      if (aWeakness && !bWeakness) return -1;
      if (!aWeakness && bWeakness) return 1;

      // 2. Eficiência de Dano por ponto de liderança
      const aCost = a.leadershipCost || 1;
      const bCost = b.leadershipCost || 1;
      const aEff = (a.customAttack || a.baseAttack) / aCost;
      const bEff = (b.customAttack || b.baseAttack) / bCost;
      return bEff - aEff;
    });

  let remainingMonsterCapacity = maxMonsters;
  let totalMonsterDamage = 0;

  for (const mon of availableMonsters) {
    if (remainingMonsterCapacity <= 0) break;
    const costPerUnit = mon.leadershipCost || 1;
    const maxUnitsFit = Math.floor(remainingMonsterCapacity / costPerUnit);
    if (maxUnitsFit <= 0) continue;

    const count = Math.min(mon.ownedCount, maxUnitsFit);
    if (count <= 0) continue;

    const { unitAttack, unitHealth } = calculateUnitCombatStats(
      mon,
      profile,
      captain,
      captainBonusPercent,
      dragonBonusPercent
    );

    dispatchedTroopsList.push({
      id: mon.id,
      name: mon.name,
      tier: mon.tier,
      troopClass: mon.troopClass,
      category: 'monster',
      isMercenary: false,
      count,
      unitAttack,
      unitHealth,
      avatarIcon: mon.avatarIcon || mon.id,
    });

    totalMonsterDamage += count * unitAttack;
    remainingMonsterCapacity -= count * costPerUnit;
  }

  const totalEliteDamage = totalMercDamage + totalMonsterDamage;
  const eliteCanSolo = totalEnemyHp > 0 && totalEliteDamage >= totalEnemyHp;

  // 5. SLOT 1: GUARDAS & ESPECIALISTAS (Limitado estritamente por maxGuards)
  const regularGuards = availableTroops.filter(
    (t) => t.category === 'guardsman' || t.category === 'specialist'
  );
  const nobleTroops = regularGuards.filter((t) => t.tier >= 2);
  const fodderTroops = regularGuards.filter((t) => t.tier === 1);

  let remainingGuardsCapacity = maxGuards;

  // Garantir Bucha T1 adaptada às linhas inimigas
  // Se inimigo tem Arqueiros -> Bucha de Arqueiro I é OBRIGATÓRIA para absorver dano de longo alcance
  // Se inimigo tem Melee -> Bucha de Lanceiro I é OBRIGATÓRIA para absorver dano frontal
  const rangedFodder = fodderTroops.find((f) => f.troopClass === 'ranged');
  const meleeFodder = fodderTroops.find((f) => f.troopClass === 'melee');

  if (hasEnemyRanged && rangedFodder && remainingGuardsCapacity > 0) {
    const fodderCount = Math.min(rangedFodder.ownedCount, Math.min(remainingGuardsCapacity, 200));
    if (fodderCount > 0) {
      const { unitAttack, unitHealth } = calculateUnitCombatStats(
        rangedFodder,
        profile,
        captain,
        captainBonusPercent,
        dragonBonusPercent
      );
      dispatchedTroopsList.push({
        id: rangedFodder.id,
        name: rangedFodder.name,
        tier: rangedFodder.tier,
        troopClass: rangedFodder.troopClass,
        category: rangedFodder.category,
        isMercenary: false,
        count: fodderCount,
        unitAttack,
        unitHealth,
        avatarIcon: rangedFodder.avatarIcon || rangedFodder.id,
      });
      remainingGuardsCapacity -= fodderCount;
    }
  }

  if (hasEnemyMelee && meleeFodder && remainingGuardsCapacity > 0) {
    const fodderCount = Math.min(meleeFodder.ownedCount, Math.min(remainingGuardsCapacity, 150));
    if (fodderCount > 0) {
      const { unitAttack, unitHealth } = calculateUnitCombatStats(
        meleeFodder,
        profile,
        captain,
        captainBonusPercent,
        dragonBonusPercent
      );
      dispatchedTroopsList.push({
        id: meleeFodder.id,
        name: meleeFodder.name,
        tier: meleeFodder.tier,
        troopClass: meleeFodder.troopClass,
        category: meleeFodder.category,
        isMercenary: false,
        count: fodderCount,
        unitAttack,
        unitHealth,
        avatarIcon: meleeFodder.avatarIcon || meleeFodder.id,
      });
      remainingGuardsCapacity -= fodderCount;
    }
  }

  if (!eliteCanSolo) {
    // Classificar nobres regulares por relevância tática
    const sortedNobles = [...nobleTroops].sort((a, b) => {
      if (enemyHasBonusVsMounted && a.troopClass === 'mounted') return 1;
      if (enemyHasBonusVsMelee && a.troopClass === 'melee') return 1;
      const aMatchesWeakness = weaknessClasses.includes(a.troopClass);
      const bMatchesWeakness = weaknessClasses.includes(b.troopClass);
      if (aMatchesWeakness && !bMatchesWeakness) return -1;
      if (!aMatchesWeakness && bMatchesWeakness) return 1;

      if (b.tier !== a.tier) return b.tier - a.tier;
      return (b.customAttack || b.baseAttack) - (a.customAttack || a.baseAttack);
    });

    for (const noble of sortedNobles) {
      if (remainingGuardsCapacity <= 0) break;
      const alreadyAllocated = dispatchedTroopsList.find((t) => t.id === noble.id)?.count || 0;
      const availableLeft = noble.ownedCount - alreadyAllocated;
      if (availableLeft <= 0) continue;

      const count = Math.min(availableLeft, remainingGuardsCapacity);
      const existing = dispatchedTroopsList.find((t) => t.id === noble.id);
      if (existing) {
        existing.count += count;
      } else {
        const { unitAttack, unitHealth } = calculateUnitCombatStats(
          noble,
          profile,
          captain,
          captainBonusPercent,
          dragonBonusPercent
        );
        dispatchedTroopsList.push({
          id: noble.id,
          name: noble.name,
          tier: noble.tier,
          troopClass: noble.troopClass,
          category: noble.category,
          isMercenary: false,
          count,
          unitAttack,
          unitHealth,
          avatarIcon: noble.avatarIcon || noble.id,
        });
      }
      remainingGuardsCapacity -= count;
    }
  }

  return dispatchedTroopsList;

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
  const maxAvailable = Math.max(...(template.availableLevels || [template.defaultLevel]), template.defaultLevel);
  const maxLevelToTest = Math.min(45, Math.max(30, maxAvailable));

  let bestLevel = 1;
  let bestXp = 0;
  let foundSafe = false;

  for (let lvl = maxLevelToTest; lvl >= 1; lvl--) {
    const target = buildMonsterTargetFromTemplate(template, lvl);
    if (!target.enemySquads || target.enemySquads.length === 0) continue;
    const dispatched = buildDispatchedTroops(troops, profile, target, captain, sendDragon);
    if (dispatched.length === 0) continue;

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

