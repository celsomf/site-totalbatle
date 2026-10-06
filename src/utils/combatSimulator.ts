import { TroopAspects, TroopClass, TroopTrait, TroopUnit, PlayerProfile, EnemySquadUnit, CombatRoundStep, SquadCasualty, CombatSimulationResult, Captain, MonsterTarget } from '../types';
import type { MonsterPresetTemplate } from '../data/monsters';
import { buildMonsterTargetFromTemplate } from '../domain/monsterTargets';
import { getCaptainMonsterAttackBonus } from './captainStats';

export interface DispatchedTroop {
  id: string;
  name: string;
  tier: number;
  troopClass: TroopClass;
  traits?: TroopTrait[];
  category?: 'guardsman' | 'specialist' | 'monster' | 'mercenary';
  isMercenary?: boolean;
  count: number;
  unitAttack: number;
  unitHealth: number;
  aspects?: TroopAspects;
  avatarIcon?: string;
}

const TROOP_CLASS_LABELS: Record<TroopClass, string> = {
  melee: 'corpo a corpo',
  ranged: 'longo alcance',
  mounted: 'montadas',
  flying: 'voadoras',
  siege: 'armas de cerco',
};

const TROOP_TRAIT_LABELS: Record<TroopTrait, string> = {
  beast: 'feras',
  giant: 'gigantes',
  dragon: 'dragões',
  elemental: 'elementais',
  fortification: 'fortificações',
  human: 'humanos',
};

function getAspectBonusAgainstClass(aspects: TroopAspects | undefined, troopClass: TroopClass): number {
  if (!aspects) return 0;

  switch (troopClass) {
    case 'melee': return aspects.bonusVsMeleePercent || 0;
    case 'ranged': return aspects.bonusVsRangedPercent || 0;
    case 'mounted': return aspects.bonusVsMountedPercent || 0;
    case 'flying': return aspects.bonusVsFlyingPercent || 0;
    case 'siege': return aspects.bonusVsSiegePercent || 0;
  }
}

function getTargetTraits(target: {
  traits?: TroopTrait[];
  family?: EnemySquadUnit['family'];
  subType?: string;
  name?: string;
  id?: string;
}): TroopTrait[] {
  const traits = new Set<TroopTrait>(target.traits || []);
  const normalized = `${target.family || ''} ${target.subType || ''} ${target.name || ''} ${target.id || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (target.family === 'elemental' || normalized.includes('elemental')) traits.add('elemental');
  if (target.family === 'dragons' || normalized.includes('dragao') || normalized.includes('dragon')) traits.add('dragon');
  if (normalized.includes('fera') || normalized.includes('beast') || normalized.includes('besta') || normalized.includes('boar')) traits.add('beast');
  if (normalized.includes('gigante') || normalized.includes('giant')) traits.add('giant');
  if (normalized.includes('fortification') || normalized.includes('fortificacao')) traits.add('fortification');
  if (normalized.includes('humano') || normalized.includes('human')) traits.add('human');

  return [...traits];
}

function getAspectBonusAgainstTarget(
  aspects: TroopAspects | undefined,
  targetClass: TroopClass,
  targetTraits: TroopTrait[] = []
): number {
  if (!aspects) return 0;

  const traitBonuses: Record<TroopTrait, number | undefined> = {
    beast: aspects.bonusVsBeastsPercent,
    giant: aspects.bonusVsGiantsPercent,
    dragon: aspects.bonusVsDragonsPercent,
    elemental: aspects.bonusVsElementalsPercent,
    fortification: aspects.bonusVsFortificationsPercent,
    human: aspects.bonusVsHumanPercent,
  };

  return getAspectBonusAgainstClass(aspects, targetClass) + targetTraits.reduce(
    (sum, trait) => sum + (traitBonuses[trait] || 0),
    0
  );
}

function getAspectBonusDescription(
  aspects: TroopAspects | undefined,
  targetClass: TroopClass,
  targetTraits: TroopTrait[]
): string | undefined {
  if (!aspects) return undefined;

  const parts: string[] = [];
  const classBonus = getAspectBonusAgainstClass(aspects, targetClass);
  if (classBonus > 0) parts.push(`+${classBonus}% vs ${TROOP_CLASS_LABELS[targetClass]}`);

  const traitBonuses: Record<TroopTrait, number | undefined> = {
    beast: aspects.bonusVsBeastsPercent,
    giant: aspects.bonusVsGiantsPercent,
    dragon: aspects.bonusVsDragonsPercent,
    elemental: aspects.bonusVsElementalsPercent,
    fortification: aspects.bonusVsFortificationsPercent,
    human: aspects.bonusVsHumanPercent,
  };
  targetTraits.forEach((trait) => {
    const bonus = traitBonuses[trait] || 0;
    if (bonus > 0) parts.push(`+${bonus}% vs ${TROOP_TRAIT_LABELS[trait]}`);
  });

  return parts.length > 0 ? parts.join('; ') : undefined;
}

function getExpectedAspectMultiplier(aspects: TroopAspects | undefined, enemySquads: EnemySquadUnit[]): number {
  const totalEnemyHealth = enemySquads.reduce((sum, squad) => sum + squad.unitHealth * squad.count, 0);
  if (totalEnemyHealth <= 0) return 1;

  const weightedMultiplier = enemySquads.reduce((sum, squad) => {
    const healthWeight = squad.unitHealth * squad.count;
    const aspectMultiplier = 1 + getAspectBonusAgainstTarget(
      aspects,
      squad.troopClass,
      getTargetTraits(squad)
    ) / 100;
    return sum + healthWeight * aspectMultiplier;
  }, 0);

  return weightedMultiplier / totalEnemyHealth;
}

function getExpectedAttack(
  troop: TroopUnit,
  profile: PlayerProfile,
  captain: Captain,
  captainBonusPercent: number,
  dragonBonusPercent: number,
  enemySquads: EnemySquadUnit[]
): number {
  const { unitAttack } = calculateUnitCombatStats(
    troop,
    profile,
    captain,
    captainBonusPercent,
    dragonBonusPercent
  );
  return unitAttack * getExpectedAspectMultiplier(troop.aspects, enemySquads);
}

function getExpectedIncomingDamageMultiplier(
  troopClass: TroopClass,
  enemySquads: EnemySquadUnit[],
  troopTraits: TroopTrait[] = []
): number {
  const totalEnemyAttack = enemySquads.reduce(
    (sum, squad) => sum + squad.unitAttack * squad.count,
    0
  );
  if (totalEnemyAttack <= 0) return 1;

  const weightedMultiplier = enemySquads.reduce((sum, squad) => {
    const attackWeight = squad.unitAttack * squad.count;
    const aspectMultiplier = 1 + getAspectBonusAgainstTarget(
      squad.aspects,
      troopClass,
      troopTraits
    ) / 100;
    return sum + attackWeight * aspectMultiplier;
  }, 0);

  return weightedMultiplier / totalEnemyAttack;
}

function getExpectedCombatScore(
  troop: TroopUnit,
  profile: PlayerProfile,
  captain: Captain,
  captainBonusPercent: number,
  dragonBonusPercent: number,
  enemySquads: EnemySquadUnit[]
): number {
  const expectedAttack = getExpectedAttack(
    troop, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
  );
  const expectedIncomingMultiplier = getExpectedIncomingDamageMultiplier(
    troop.troopClass,
    enemySquads,
    getTargetTraits(troop)
  );

  return expectedAttack / expectedIncomingMultiplier;
}

function getExpectedAttackPerLeadership(
  troop: TroopUnit,
  profile: PlayerProfile,
  captain: Captain,
  captainBonusPercent: number,
  dragonBonusPercent: number,
  enemySquads: EnemySquadUnit[]
): number {
  return getExpectedCombatScore(troop, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads)
    / Math.max(1, troop.leadershipCost || 1);
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

function doesNotIncreaseCasualties(
  baseline: CombatSimulationResult,
  candidate: CombatSimulationResult
): boolean {
  if (baseline.outcome !== 'VICTORY' || candidate.outcome !== 'VICTORY') return false;

  const baselineLosses = new Map(
    baseline.playerCasualties.map((casualty) => [casualty.id, casualty.lostCount])
  );

  return candidate.playerCasualties.every(
    (casualty) => casualty.lostCount <= (baselineLosses.get(casualty.id) || 0)
  );
}

function trimRedundantHighRiskTroops(
  dispatched: DispatchedTroop[],
  enemySquads: EnemySquadUnit[]
): DispatchedTroop[] {
  let optimized = [...dispatched];
  let baseline = simulateCombat(optimized, enemySquads);
  if (baseline.outcome !== 'VICTORY') return optimized;

  const atRiskTroops = [...optimized]
    .filter((troop) => getExpectedIncomingDamageMultiplier(troop.troopClass, enemySquads, troop.traits) > 1)
    .sort((a, b) =>
      getExpectedIncomingDamageMultiplier(b.troopClass, enemySquads, b.traits) -
      getExpectedIncomingDamageMultiplier(a.troopClass, enemySquads, a.traits)
    );

  for (const troop of atRiskTroops) {
    const current = optimized.find((entry) => entry.id === troop.id);
    if (!current || current.count <= 0) continue;

    const withoutTroop = optimized.filter((entry) => entry.id !== troop.id);
    const withoutResult = simulateCombat(withoutTroop, enemySquads);
    if (doesNotIncreaseCasualties(baseline, withoutResult)) {
      optimized = withoutTroop;
      baseline = withoutResult;
      continue;
    }

    // Keep only the smallest stack that preserves victory and does not add casualties.
    let low = 1;
    let high = current.count;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const reduced = optimized.map((entry) =>
        entry.id === troop.id ? { ...entry, count: mid } : entry
      );
      const reducedResult = simulateCombat(reduced, enemySquads);
      if (doesNotIncreaseCasualties(baseline, reducedResult)) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    if (low < current.count) {
      const reduced = optimized.map((entry) =>
        entry.id === troop.id ? { ...entry, count: low } : entry
      );
      const reducedResult = simulateCombat(reduced, enemySquads);
      if (doesNotIncreaseCasualties(baseline, reducedResult)) {
        optimized = reduced;
        baseline = reducedResult;
      }
    }
  }

  return optimized;
}

/**
 * Reorganiza os guardas enviados da mesma classe em camadas de ataque.
 * Cada nível inferior é dimensionado para entregar ataque próximo ao nível acima,
 * seguindo a fórmula de empilhamento do vídeo.
 */
function rebalanceGuardTierStacks(
  dispatched: DispatchedTroop[],
  availableGuards: TroopUnit[],
  profile: PlayerProfile,
  captain: Captain,
  captainBonusPercent: number,
  dragonBonusPercent: number,
  enemySquads: EnemySquadUnit[]
): DispatchedTroop[] {
  let optimized = [...dispatched];
  const deployedClasses = new Set(
    optimized
      .filter((troop) => troop.category === 'guardsman' && troop.tier >= 2)
      .map((troop) => troop.troopClass)
  );

  for (const troopClass of deployedClasses) {
    const deployedLayers = optimized.filter(
      (troop) => troop.category === 'guardsman' && troop.tier >= 2 && troop.troopClass === troopClass
    );
    const totalClassCount = deployedLayers.reduce((sum, troop) => sum + troop.count, 0);
    const highestDeployedTier = Math.max(...deployedLayers.map((troop) => troop.tier));
    let layers = availableGuards
      .filter((troop) =>
        troop.category === 'guardsman' &&
        troop.troopClass === troopClass &&
        troop.tier >= 2 &&
        troop.tier <= highestDeployedTier
      )
      .sort((a, b) => b.tier - a.tier);

    if (layers.length < 2 || totalClassCount <= 1) continue;

    let layerAttacks = layers.map((troop) => getExpectedAttack(
      troop,
      profile,
      captain,
      captainBonusPercent,
      dragonBonusPercent,
      enemySquads
    ));

    while (layers.length >= 2) {
      let bestCounts: number[] | null = null;
      let low = 1;
      let high = Math.min(totalClassCount, layers[0].ownedCount);

      while (low <= high) {
        const anchorCount = Math.floor((low + high) / 2);
        const counts = [anchorCount];

        for (let index = 1; index < layers.length; index += 1) {
          const previousAttack = layerAttacks[index - 1];
          const currentAttack = layerAttacks[index];
          const previousCount = counts[index - 1];
          counts.push(currentAttack > 0
            ? Math.ceil(previousCount * previousAttack / currentAttack)
            : Number.POSITIVE_INFINITY);
        }

        const fitsStock = counts.every((count, index) => count <= layers[index].ownedCount);
        const fitsCapacity = counts.reduce((sum, count) => sum + count, 0) <= totalClassCount;

        if (fitsStock && fitsCapacity) {
          bestCounts = counts;
          low = anchorCount + 1;
        } else {
          high = anchorCount - 1;
        }
      }

      if (!bestCounts) {
        // If the full chain cannot fit, keep the strongest layers and try a
        // shorter chain rather than dropping the class from the march.
        layers = layers.slice(0, -1);
        layerAttacks = layerAttacks.slice(0, -1);
        continue;
      }

      let remaining = totalClassCount - bestCounts.reduce((sum, count) => sum + count, 0);
      while (remaining > 0) {
        let weakestLayerIndex = -1;
        let weakestLayerAttack = Number.POSITIVE_INFINITY;

        for (let index = 0; index < layers.length; index += 1) {
          if (bestCounts[index] >= layers[index].ownedCount) continue;
          const stackAttack = bestCounts[index] * layerAttacks[index];
          if (stackAttack < weakestLayerAttack) {
            weakestLayerIndex = index;
            weakestLayerAttack = stackAttack;
          }
        }

        if (weakestLayerIndex < 0) break;
        bestCounts[weakestLayerIndex] += 1;
        remaining -= 1;
      }

      const replacedIds = new Set(deployedLayers.map((troop) => troop.id));
      optimized = optimized.filter((troop) => !replacedIds.has(troop.id));

      for (let index = 0; index < layers.length; index += 1) {
        const troop = layers[index];
        const count = bestCounts[index];
        if (count <= 0) continue;

        const { unitAttack, unitHealth } = calculateUnitCombatStats(
          troop,
          profile,
          captain,
          captainBonusPercent,
          dragonBonusPercent
        );
        optimized.push({
          id: troop.id,
          name: troop.name,
          tier: troop.tier,
          troopClass: troop.troopClass,
          traits: getTargetTraits(troop),
          category: 'guardsman',
          isMercenary: false,
          count,
          unitAttack,
          unitHealth,
          aspects: troop.aspects,
          avatarIcon: troop.avatarIcon || troop.id,
        });
      }

      break;
    }
  }

  return optimized;
}

function simulateCombatWithOpeningSide(
  dispatchedTroops: DispatchedTroop[],
  enemySquads: EnemySquadUnit[],
  openingSide: 'player' | 'enemy'
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

    // A iniciativa da maioria das tropas do jogador não está cadastrada.
    // Mantemos a ordem relativa existente, mas calculamos as duas aberturas
    // possíveis para não garantir vitória apenas porque o jogador começou.
    type CombatActor = { side: 'player' | 'enemy'; squad: any };
    const turnQueue: CombatActor[] = [];

    // Mercenários do jogador
    const playerMercs = playerSquads
      .filter((p) => p.currentCount > 0 && (p.isMercenary || p.category === 'mercenary'))
      .sort((a, b) => b.tier - a.tier || b.unitAttack - a.unitAttack);

    // Inimigos
    const sortedEnemies = enemies
      .filter((e) => e.currentCount > 0)
      .sort((a, b) => b.tier - a.tier || b.initiative - a.initiative);

    // Tropas regulares do jogador
    const playerRegulars = playerSquads
      .filter((p) => p.currentCount > 0 && !p.isMercenary && p.category !== 'mercenary')
      .sort((a, b) => b.tier - a.tier || b.unitAttack - a.unitAttack);

    const queueMercenaries = () => playerMercs.forEach((m) => turnQueue.push({ side: 'player', squad: m }));
    const queueEnemies = () => sortedEnemies.forEach((e) => turnQueue.push({ side: 'enemy', squad: e }));
    const queueRegulars = () => playerRegulars.forEach((r) => turnQueue.push({ side: 'player', squad: r }));

    if (openingSide === 'player') {
      queueMercenaries();
      queueEnemies();
      queueRegulars();
    } else {
      queueEnemies();
      queueMercenaries();
      queueRegulars();
    }

    for (const actor of turnQueue) {
      if (actor.squad.currentCount <= 0) continue;

      if (actor.side === 'player') {
        const pSquad = actor.squad;
        const targetEnemy = enemies
          .filter((e) => e.currentCount > 0)
          .sort((a, b) => b.unitAttack * b.currentCount - a.unitAttack * a.currentCount)[0];

        if (!targetEnemy) break;

        const aspectBonus = getAspectBonusAgainstTarget(
          pSquad.aspects,
          targetEnemy.troopClass,
          getTargetTraits(targetEnemy)
        );
        const aspectMultiplier = 1 + aspectBonus / 100;
        const damage = Math.round(pSquad.currentCount * pSquad.unitAttack * aspectMultiplier);
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
          bonusText: getAspectBonusDescription(
            pSquad.aspects,
            targetEnemy.troopClass,
            getTargetTraits(targetEnemy)
          ),
        });

        if (enemies.every((e) => e.currentCount <= 0)) {
          break;
        }
      } else {
        const eSquad = actor.squad;
        const alivePlayerTargets = playerSquads.filter((p) => p.currentCount > 0);
        if (alivePlayerTargets.length === 0) break;

        const targetPlayer = [...alivePlayerTargets].sort((a, b) => {
          const aBonus = getAspectBonusAgainstTarget(
            eSquad.aspects,
            a.troopClass,
            getTargetTraits(a)
          );
          const bBonus = getAspectBonusAgainstTarget(
            eSquad.aspects,
            b.troopClass,
            getTargetTraits(b)
          );
          return b.unitHealth * b.currentCount - a.unitHealth * a.currentCount ||
            bBonus - aBonus ||
            b.unitAttack * b.currentCount - a.unitAttack * a.currentCount ||
            b.tier - a.tier;
        })[0];

        const aspectBonus = getAspectBonusAgainstTarget(
          eSquad.aspects,
          targetPlayer.troopClass,
          getTargetTraits(targetPlayer)
        );
        const multiplier = 1 + aspectBonus / 100;
        const bonusText = getAspectBonusDescription(
          eSquad.aspects,
          targetPlayer.troopClass,
          getTargetTraits(targetPlayer)
        ) || '';

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

function getCasualtyHealth(result: CombatSimulationResult, dispatchedTroops: DispatchedTroop[]): number {
  const healthById = new Map(dispatchedTroops.map((troop) => [troop.id, troop.unitHealth]));
  return result.playerCasualties.reduce(
    (sum, casualty) => sum + casualty.lostCount * (healthById.get(casualty.id) || 0),
    0
  );
}

/**
 * Resolve both possible first-strike sides. If initiative data is incomplete,
 * use the less favorable result so an uncertain opening cannot become a false victory.
 */
export function simulateCombat(
  dispatchedTroops: DispatchedTroop[],
  enemySquads: EnemySquadUnit[]
): CombatSimulationResult {
  const playerOpens = simulateCombatWithOpeningSide(dispatchedTroops, enemySquads, 'player');
  const enemyOpens = simulateCombatWithOpeningSide(dispatchedTroops, enemySquads, 'enemy');

  if (playerOpens.outcome !== enemyOpens.outcome) {
    return playerOpens.outcome === 'DEFEAT' ? playerOpens : enemyOpens;
  }

  const playerLossHealth = getCasualtyHealth(playerOpens, dispatchedTroops);
  const enemyLossHealth = getCasualtyHealth(enemyOpens, dispatchedTroops);
  if (playerLossHealth !== enemyLossHealth) {
    return playerLossHealth > enemyLossHealth ? playerOpens : enemyOpens;
  }

  if (playerOpens.remainingEnemyHp !== enemyOpens.remainingEnemyHp) {
    return playerOpens.remainingEnemyHp > enemyOpens.remainingEnemyHp ? playerOpens : enemyOpens;
  }

  return playerOpens.totalPlayerDamage <= enemyOpens.totalPlayerDamage ? playerOpens : enemyOpens;
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
  const enemySquads = targetMonster.enemySquads || [];
  const totalEnemyHp = enemySquads.reduce((sum, s) => sum + s.unitHealth * s.count, 0);
  const enemyClasses = enemySquads.map((s) => s.troopClass);
  const hasEnemyRanged = enemyClasses.includes('ranged');
  const hasEnemyMelee = enemyClasses.includes('melee');
  const weaknessClasses = targetMonster.weaknessClasses || ['ranged'];

  // 2. SLOT 2: MERCENÁRIOS (Limitado por maxMercs)
  const availableMercs = availableTroops
    .filter((t) => t.category === 'mercenary')
    .sort((a, b) => {
      const aEfficiency = getExpectedCombatScore(
        a, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
      );
      const bEfficiency = getExpectedCombatScore(
        b, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
      );
      return bEfficiency - aEfficiency || b.tier - a.tier;
    });

  let remainingMercCapacity = maxMercs;

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
      traits: getTargetTraits(merc),
      category: 'mercenary',
      isMercenary: true,
      count,
      unitAttack,
      unitHealth,
      aspects: merc.aspects,
      avatarIcon: merc.avatarIcon || merc.id,
    });

    remainingMercCapacity -= count;
  }

  // 3. Avaliar inimigos, aspectos e fraquezas
  // 4. SLOT 3: MONSTROS & ESPECIAIS (Limitado por maxMonsters e leadershipCost)
  // Pontuar ataque esperado junto com o risco dos aspectos de dano do inimigo.
  const availableMonsters = availableTroops
    .filter((t) => t.category === 'monster')
    .sort((a, b) => {
      const aEfficiency = getExpectedAttackPerLeadership(
        a, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
      );
      const bEfficiency = getExpectedAttackPerLeadership(
        b, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
      );
      if (Math.abs(aEfficiency - bEfficiency) > 0.0001) return bEfficiency - aEfficiency;

      // 1. Fraqueza do monstro
      const aWeakness = weaknessClasses.includes(a.troopClass);
      const bWeakness = weaknessClasses.includes(b.troopClass);
      if (aWeakness && !bWeakness) return -1;
      if (!aWeakness && bWeakness) return 1;

      // 2. Eficiência de Dano por ponto de liderança
      return b.tier - a.tier;
    });

  let remainingMonsterCapacity = maxMonsters;

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
      traits: getTargetTraits(mon),
      category: 'monster',
      isMercenary: false,
      count,
      unitAttack,
      unitHealth,
      aspects: mon.aspects,
      avatarIcon: mon.avatarIcon || mon.id,
    });

    remainingMonsterCapacity -= count * costPerUnit;
  }

  // Use the real turn order and class aspects before omitting guards from the march.
  const eliteCanSolo = totalEnemyHp > 0 && simulateCombat(dispatchedTroopsList, enemySquads).outcome === 'VICTORY';

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
        traits: getTargetTraits(rangedFodder),
        category: rangedFodder.category,
        isMercenary: false,
        count: fodderCount,
        unitAttack,
        unitHealth,
        aspects: rangedFodder.aspects,
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
        traits: getTargetTraits(meleeFodder),
        category: meleeFodder.category,
        isMercenary: false,
        count: fodderCount,
        unitAttack,
        unitHealth,
        aspects: meleeFodder.aspects,
        avatarIcon: meleeFodder.avatarIcon || meleeFodder.id,
      });
      remainingGuardsCapacity -= fodderCount;
    }
  }

  if (!eliteCanSolo) {
    // Classificar nobres regulares por relevância tática
    const sortedNobles = [...nobleTroops].sort((a, b) => {
      const aEfficiency = getExpectedCombatScore(
        a, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
      );
      const bEfficiency = getExpectedCombatScore(
        b, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
      );
      if (Math.abs(aEfficiency - bEfficiency) > 0.0001) return bEfficiency - aEfficiency;

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
          traits: getTargetTraits(noble),
          category: noble.category,
          isMercenary: false,
          count,
          unitAttack,
          unitHealth,
          aspects: noble.aspects,
          avatarIcon: noble.avatarIcon || noble.id,
        });
      }
      remainingGuardsCapacity -= count;
    }
  }

  const stackedTroopsList = rebalanceGuardTierStacks(
    dispatchedTroopsList,
    nobleTroops.filter((troop) => troop.category === 'guardsman'),
    profile,
    captain,
    captainBonusPercent,
    dragonBonusPercent,
    enemySquads
  );

  return trimRedundantHighRiskTroops(stackedTroopsList, enemySquads);
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
