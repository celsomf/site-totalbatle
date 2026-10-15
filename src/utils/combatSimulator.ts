import { TroopAspects, TroopClass, TroopTrait, TroopUnit, PlayerProfile, EnemySquadUnit, CombatRoundStep, SquadCasualty, CombatSimulationResult, Captain, MonsterTarget } from '../types';
import type { MonsterPresetTemplate } from '../data/monsters';
import { buildMonsterTargetFromTemplate } from '../domain/monsterTargets';
import { getCaptainCombatBonusForTroop } from './combatCaptainStats';
import { isOwnTroop } from '../domain/ownTroops';
import { applySquadDamage } from '../domain/squadDamage';
import { calculateHitDamage, selectDamageTarget, strongestAvailable, COMBAT_ENGINE_VERSION } from '../domain/combatRules';

export interface DispatchedTroop {
  id: string;
  name: string;
  tier: number;
  troopClass: TroopClass;
  traits?: TroopTrait[];
  category?: 'guardsman' | 'specialist' | 'monster' | 'mercenary';
  isMercenary?: boolean;
  count: number;
  /** Leadership / authority / dominance consumed by one unit in this stack. */
  leadershipCost?: number;
  unitAttack: number;
  baseAttack?: number;
  initiative?: number;
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
  epic: 'monstros épicos',
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
  if (target.family === 'epic') traits.add('epic');
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
    epic: aspects.bonusVsEpicMonstersPercent,
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
    epic: aspects.bonusVsEpicMonstersPercent,
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
    dragonBonusPercent,
    enemySquads.some((squad) => squad.family === 'epic')
  );
  return unitAttack + (troop.customAttack || troop.baseAttack) * (getExpectedAspectMultiplier(troop.aspects, enemySquads) - 1);
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
  dragonBonusPercent: number,
  vsEpicMonster = false
): { unitAttack: number; unitHealth: number } {
  const captainLevel = profile.captainLevels?.[captain.id] || captain.level || 1;
  const captainStars = profile.captainStars?.[captain.id] || captain.stars || 1;
  const captainBonus = getCaptainCombatBonusForTroop(
    captain,
    captainLevel,
    captainStars,
    troop,
    vsEpicMonster
  );
  const accountStrengthBonus = profile.heroGeneralAttackPercent || 0;
  const captainGeneralAttackBonus = profile.captainGeneralAttackPercent?.[captain.id] || 0;
  let attackBonusPercent = captainBonusPercent + captainBonus.strengthPercent + accountStrengthBonus + captainGeneralAttackBonus + dragonBonusPercent;
  let healthBonusPercent = captainBonus.healthPercent;

  if (troop.category === 'guardsman' || troop.aspects?.receivesGuardsmenBonuses) {
    attackBonusPercent += profile.academyBonus?.guardsmenAttack ?? 25;
    healthBonusPercent += profile.academyBonus?.guardsmenHealth ?? 25.5;
  } else if (troop.category === 'specialist') {
    attackBonusPercent += profile.academyBonus?.specialistsAttack ?? 15;
    healthBonusPercent += profile.academyBonus?.specialistsHealth ?? 10;
  } else if (troop.category === 'monster' || troop.category === 'mercenary') {
    attackBonusPercent += profile.academyBonus?.monstersAttack ?? 20;
    healthBonusPercent += profile.academyBonus?.monstersHealth ?? 20;
  } else {
    attackBonusPercent += 20;
    healthBonusPercent += 20;
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

function getStackLineKey(troop: TroopUnit): string | undefined {
  if (troop.category === 'guardsman') return `guardsman:${troop.troopClass}`;

  // Especialistas e monstros só podem ser empilhados com outras versões da
  // mesma unidade. A classe sozinha não prova que duas unidades são da mesma linha.
  const tieredFamily = troop.id.match(/^(?:s|m)(\d+)_(.+)$/i);
  if (tieredFamily && (troop.category === 'specialist' || troop.category === 'monster')) {
    return `${troop.category}:${tieredFamily[2].toLowerCase()}`;
  }

  return undefined;
}

/**
 * Aplica o método do vídeo por linha de tropa: 100 unidades do nível mais alto
 * e, para cada nível inferior, força do nível superior × 100 ÷ força inferior.
 * O fator 100 é escalado para caber no orçamento e no estoque de cada linha.
 */
function rebalanceTroopTierStacks(
  dispatched: DispatchedTroop[],
  availableTroops: TroopUnit[],
  profile: PlayerProfile,
  captain: Captain,
  captainBonusPercent: number,
  dragonBonusPercent: number,
  enemySquads: EnemySquadUnit[]
): DispatchedTroop[] {
  let optimized = [...dispatched];
  const lineKeys = new Set(optimized.map((troop) => {
    const source = availableTroops.find((candidate) => candidate.id === troop.id);
    return source ? getStackLineKey(source) : undefined;
  }).filter((key): key is string => Boolean(key)));

  for (const lineKey of lineKeys) {
    const deployedLayers = optimized.filter((troop) => {
      const source = availableTroops.find((candidate) => candidate.id === troop.id);
      return source && getStackLineKey(source) === lineKey;
    });
    const lineBudget = deployedLayers.reduce((sum, troop) => {
      const source = availableTroops.find((candidate) => candidate.id === troop.id);
      return sum + troop.count * (source?.leadershipCost || 1);
    }, 0);
    if (lineBudget <= 0) continue;

    const highestDeployedTier = Math.max(...deployedLayers.map((troop) => troop.tier));
    let layers = availableTroops
      .filter((troop) => getStackLineKey(troop) === lineKey && troop.ownedCount > 0 && troop.tier <= highestDeployedTier)
      .sort((a, b) => b.tier - a.tier);
    let layerAttacks = layers.map((troop) => getExpectedAttack(
      troop, profile, captain, captainBonusPercent, dragonBonusPercent, enemySquads
    ));

    while (layers.length >= 2) {
      const topAttack = layerAttacks[0];
      if (topAttack <= 0) break;

      let bestCounts: number[] | undefined;
      let low = 1;
      let high = Math.min(Math.floor(lineBudget / (layers[0].leadershipCost || 1)), layers[0].ownedCount);

      while (low <= high) {
        const anchorCount = Math.floor((low + high) / 2);
        const counts = layers.map((layer, index) => {
          const attack = layerAttacks[index];
          return attack > 0 ? Math.ceil(anchorCount * topAttack / attack) : Number.POSITIVE_INFINITY;
        });
        const fitsStock = counts.every((count, index) => count <= layers[index].ownedCount);
        const fitsBudget = counts.reduce(
          (sum, count, index) => sum + count * (layers[index].leadershipCost || 1),
          0
        ) <= lineBudget;

        if (fitsStock && fitsBudget) {
          bestCounts = counts;
          low = anchorCount + 1;
        } else {
          high = anchorCount - 1;
        }
      }

      // If the lowest layer cannot fit even once, retry with the next complete
      // chain. Do not put leftover units into one layer: that breaks the ratio.
      if (!bestCounts) {
        layers = layers.slice(0, -1);
        layerAttacks = layerAttacks.slice(0, -1);
        continue;
      }

      const replacedIds = new Set(deployedLayers.map((troop) => troop.id));
      optimized = optimized.filter((troop) => !replacedIds.has(troop.id));
      for (let index = 0; index < layers.length; index += 1) {
        const troop = layers[index];
        const count = bestCounts[index];
        const { unitAttack, unitHealth } = calculateUnitCombatStats(
          troop,
          profile,
          captain,
          captainBonusPercent,
          dragonBonusPercent,
          enemySquads.some((squad) => squad.family === 'epic')
        );
        optimized.push({
          id: troop.id,
          name: troop.name,
          tier: troop.tier,
          troopClass: troop.troopClass,
          traits: getTargetTraits(troop),
          category: troop.category,
          isMercenary: troop.category === 'mercenary',
          count,
          leadershipCost: troop.leadershipCost || 1,
          unitAttack,
          unitHealth,
          baseAttack: troop.customAttack || troop.baseAttack,
          initiative: troop.initiative,
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
      residualDamage: 0,
    }));

  const enemies = enemySquads
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      currentCount: s.count,
      initialCount: s.count,
      residualDamage: 0,
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

    // Official combat video01:22–01:45: alternate sides; each living stack acts once.
    // If one side exhausts its stacks, the other finishes its remaining attacks.
    type CombatActor = { side: 'player'; squad: typeof playerSquads[number] } | { side: 'enemy'; squad: typeof enemies[number] };
    const actedPlayers = new Set<string>();
    const actedEnemies = new Set<string>();
    let nextSide = openingSide;
    while (true) {
      const nextPlayer = strongestAvailable(playerSquads.filter(unit => !actedPlayers.has(unit.id)));
      const nextEnemy = strongestAvailable(enemies.filter(unit => !actedEnemies.has(unit.id)));
      if (!nextPlayer && !nextEnemy) break;
      const actor: CombatActor = nextPlayer && (nextSide === 'player' || !nextEnemy)
        ? { side: 'player', squad: nextPlayer } : { side: 'enemy', squad: nextEnemy! };
      if (actor.side === 'player') actedPlayers.add(actor.squad.id); else actedEnemies.add(actor.squad.id);
      nextSide = actor.side === 'player' ? 'enemy' : 'player';

      if (actor.side === 'player') {
        const pSquad = actor.squad;
        const targetEnemy = selectDamageTarget(enemies, enemy => calculateHitDamage(pSquad,
          getAspectBonusAgainstTarget(pSquad.aspects, enemy.troopClass, getTargetTraits(enemy))));

        if (!targetEnemy) break;

        const aspectBonus = getAspectBonusAgainstTarget(
          pSquad.aspects,
          targetEnemy.troopClass,
          getTargetTraits(targetEnemy)
        );
        const damage = calculateHitDamage(pSquad, aspectBonus);
        totalPlayerDamage += damage;

        const hit = applySquadDamage(targetEnemy, damage);
        const casualties = hit.casualties;
        targetEnemy.currentCount = hit.currentCount;
        targetEnemy.residualDamage = hit.residualDamage;

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

        const targetPlayer = selectDamageTarget(alivePlayerTargets, player => calculateHitDamage(eSquad,
          getAspectBonusAgainstTarget(eSquad.aspects, player.troopClass, getTargetTraits(player))))!;

        const aspectBonus = getAspectBonusAgainstTarget(
          eSquad.aspects,
          targetPlayer.troopClass,
          getTargetTraits(targetPlayer)
        );
        const bonusText = getAspectBonusDescription(
          eSquad.aspects,
          targetPlayer.troopClass,
          getTargetTraits(targetPlayer)
        ) || '';

        const damage = calculateHitDamage(eSquad, aspectBonus);
        totalEnemyDamage += damage;

        const hit = applySquadDamage(targetPlayer, damage);
        const casualties = hit.casualties;
        targetPlayer.currentCount = hit.currentCount;
        targetPlayer.residualDamage = hit.residualDamage;

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
    category: p.category,
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

  const remainingEnemyHp = enemies.reduce((sum, e) => sum + e.unitHealth * e.currentCount - e.residualDamage, 0);

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
    model: { version: COMBAT_ENGINE_VERSION, validationStatus: 'experimental', assumptions: [
      'Atributos efetivos da conta ainda não conferidos com as fichas desta batalha.',
      'Dano parcial conservado entre golpes: hipótese ainda não validada.',
      'Empates de dano usam desempate determinístico; regra exata ainda não confirmada.',
      'Duas aberturas fixas avaliadas; não representam todas as sequências aleatórias por rodada.',
      'Iniciativa própria ausente não é inferida do nível ou da classe.',
      'Acertos críticos não são sorteados; limite de dez rodadas no cenário.',
      'Grupos antigos sem força-base separada usam a força efetiva como aproximação para aspectos; não validação.',
    ] },
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
  // Only decide initiative when every participating unit has a sourced value.
  const livingPlayers = dispatchedTroops.filter(unit => unit.count > 0);
  const livingEnemies = enemySquads.filter(unit => unit.count > 0);
  if (livingPlayers.length && livingEnemies.length && [...livingPlayers, ...livingEnemies].every(unit => Number.isFinite(unit.initiative))) {
    const playerInitiative = Math.max(...livingPlayers.map(unit => unit.initiative!));
    const enemyInitiative = Math.max(...livingEnemies.map(unit => unit.initiative));
    if (playerInitiative !== enemyInitiative) return playerInitiative > enemyInitiative ? playerOpens : enemyOpens;
  }

  if (playerOpens.outcome !== enemyOpens.outcome) {
    return playerOpens.outcome === 'DEFEAT' ? playerOpens : enemyOpens;
  }

  const lossPriority = compareValuableLosses(playerOpens, enemyOpens);
  if (lossPriority !== 0) return lossPriority > 0 ? playerOpens : enemyOpens;
  const playerLossHealth = getCasualtyHealth(playerOpens, dispatchedTroops);
  const enemyLossHealth = getCasualtyHealth(enemyOpens, dispatchedTroops);
  if (playerLossHealth !== enemyLossHealth) {
    return playerLossHealth > enemyLossHealth ? playerOpens : enemyOpens;
  }

  if (playerOpens.remainingEnemyHp !== enemyOpens.remainingEnemyHp) {
    return playerOpens.remainingEnemyHp > enemyOpens.remainingEnemyHp ? playerOpens : enemyOpens;
  }

  if (playerOpens.totalEnemyDamage !== enemyOpens.totalEnemyDamage) {
    return playerOpens.totalEnemyDamage > enemyOpens.totalEnemyDamage ? playerOpens : enemyOpens;
  }

  return playerOpens.totalPlayerDamage <= enemyOpens.totalPlayerDamage ? playerOpens : enemyOpens;
}

/**
 * Constrói a lista de tropas enviadas na marcha com base no estoque real do jogador,
 * respeitando os limites de marcha do monstro e aplicando bônus de dragão, academia e capitão.
 */
function buildInitialDispatchedTroops(
  troops: TroopUnit[],
  profile: PlayerProfile,
  targetMonster: MonsterTarget,
  captain: Captain,
  sendDragon: boolean,
  candidates?: DispatchedTroop[][]
): DispatchedTroop[] {
  const isRare = targetMonster.attackMode === 'rare';
  const isCommon = targetMonster.attackMode === 'common';

  // O bônus do capitão é calculado para cada tipo de tropa mais abaixo.
  const captainBonusPercent = 0;
  const dragonBonusPercent = sendDragon ? 15 : 0;

  const maxGuards =
    profile.maxMarchCapacity ??
    targetMonster.marchCapacities?.guards ??
    (isRare ? 5250 : isCommon ? 2725 : 2000);
  const maxMercs =
    profile.mercenaryCapacity ??
    targetMonster.marchCapacities?.mercenaries ??
    (isRare ? 2520 : isCommon ? 1340 : 1000);
  const maxMonsters =
    profile.specialCapacity ??
    targetMonster.marchCapacities?.monsters ??
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
    const leadershipCost = merc.leadershipCost || 1;
    const count = Math.min(merc.ownedCount, Math.floor(remainingMercCapacity / leadershipCost));
    if (count <= 0) continue;

    const { unitAttack, unitHealth } = calculateUnitCombatStats(
      merc,
      profile,
      captain,
      captainBonusPercent,
      dragonBonusPercent,
      targetMonster.type === 'epic_monster'
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
      leadershipCost,
      unitAttack,
      unitHealth,
      baseAttack: merc.customAttack || merc.baseAttack,
      initiative: merc.initiative,
      aspects: merc.aspects,
      avatarIcon: merc.avatarIcon || merc.id,
    });

    remainingMercCapacity -= count * leadershipCost;
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
      dragonBonusPercent,
      targetMonster.type === 'epic_monster'
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
      leadershipCost: costPerUnit,
      unitAttack,
      unitHealth,
      baseAttack: mon.customAttack || mon.baseAttack,
      initiative: mon.initiative,
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
    const leadershipCost = rangedFodder.leadershipCost || 1;
    const fodderCount = Math.min(
      rangedFodder.ownedCount,
      Math.min(Math.floor(remainingGuardsCapacity / leadershipCost), 200)
    );
    if (fodderCount > 0) {
      const { unitAttack, unitHealth } = calculateUnitCombatStats(
        rangedFodder,
        profile,
        captain,
        captainBonusPercent,
        dragonBonusPercent,
        targetMonster.type === 'epic_monster'
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
        leadershipCost,
        unitAttack,
        unitHealth,
        baseAttack: rangedFodder.customAttack || rangedFodder.baseAttack,
        initiative: rangedFodder.initiative,
        aspects: rangedFodder.aspects,
        avatarIcon: rangedFodder.avatarIcon || rangedFodder.id,
      });
      remainingGuardsCapacity -= fodderCount * leadershipCost;
    }
  }

  if (hasEnemyMelee && meleeFodder && remainingGuardsCapacity > 0) {
    const leadershipCost = meleeFodder.leadershipCost || 1;
    const fodderCount = Math.min(
      meleeFodder.ownedCount,
      Math.min(Math.floor(remainingGuardsCapacity / leadershipCost), 150)
    );
    if (fodderCount > 0) {
      const { unitAttack, unitHealth } = calculateUnitCombatStats(
        meleeFodder,
        profile,
        captain,
        captainBonusPercent,
        dragonBonusPercent,
        targetMonster.type === 'epic_monster'
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
        leadershipCost,
        unitAttack,
        unitHealth,
        baseAttack: meleeFodder.customAttack || meleeFodder.baseAttack,
        initiative: meleeFodder.initiative,
        aspects: meleeFodder.aspects,
        avatarIcon: meleeFodder.avatarIcon || meleeFodder.id,
      });
      remainingGuardsCapacity -= fodderCount * leadershipCost;
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

      const leadershipCost = noble.leadershipCost || 1;
      const count = Math.min(availableLeft, Math.floor(remainingGuardsCapacity / leadershipCost));
      const existing = dispatchedTroopsList.find((t) => t.id === noble.id);
      if (existing) {
        existing.count += count;
      } else {
        const { unitAttack, unitHealth } = calculateUnitCombatStats(
          noble,
          profile,
          captain,
          captainBonusPercent,
          dragonBonusPercent,
          targetMonster.type === 'epic_monster'
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
          leadershipCost,
          unitAttack,
          unitHealth,
          baseAttack: noble.customAttack || noble.baseAttack,
          initiative: noble.initiative,
          aspects: noble.aspects,
          avatarIcon: noble.avatarIcon || noble.id,
        });
      }
      remainingGuardsCapacity -= count * leadershipCost;
    }
  }

  candidates?.push(dispatchedTroopsList);
  const troopsToBalance = isRare || isCommon
    ? trimRedundantHighRiskTroops(dispatchedTroopsList, enemySquads)
    : dispatchedTroopsList;
  candidates?.push(troopsToBalance);
  const stackedTroopsList = rebalanceTroopTierStacks(
    troopsToBalance,
    availableTroops,
    profile,
    captain,
    captainBonusPercent,
    dragonBonusPercent,
    enemySquads
  );

  // Preserve both proposals: redistribution is a candidate, never an unchecked replacement.
  return stackedTroopsList;
}

/** Negative means fewer losses, protecting the highest tiers before lower tiers. */
export function compareLossesByTier(a: CombatSimulationResult, b: CombatSimulationResult): number {
  const tiers = [...new Set([...a.playerCasualties, ...b.playerCasualties].map((loss) => loss.tier))]
    .sort((left, right) => right - left);
  for (const tier of tiers) {
    const count = (result: CombatSimulationResult) => result.playerCasualties
      .filter((loss) => loss.tier === tier).reduce((sum, loss) => sum + loss.lostCount, 0);
    const difference = count(a) - count(b);
    if (difference !== 0) return difference;
  }
  return 0;
}

interface FormationCandidate {
  troops: DispatchedTroop[];
  result: CombatSimulationResult;
}

/** Explicit qualitative priority; no currency estimates or numeric value weights. */
export function compareValuableLosses(a: CombatSimulationResult, b: CombatSimulationResult): number {
  const special = (unit: SquadCasualty) => unit.category === 'monster' || unit.category === 'mercenary' || unit.isMercenary === true;
  const subset = (result: CombatSimulationResult, expensive: boolean) => ({ ...result,
    playerCasualties: result.playerCasualties.filter(unit => special(unit) === expensive) });
  return compareLossesByTier(subset(a, true), subset(b, true)) || compareLossesByTier(subset(a, false), subset(b, false));
}

function compareFormations(a: FormationCandidate, b: FormationCandidate): number {
  if (a.result.outcome !== b.result.outcome) return a.result.outcome === 'VICTORY' ? -1 : 1;
  if (a.result.outcome === 'DEFEAT' && a.result.remainingEnemyHp !== b.result.remainingEnemyHp) {
    return a.result.remainingEnemyHp - b.result.remainingEnemyHp;
  }
  const losses = compareValuableLosses(a.result, b.result);
  if (losses !== 0) return losses;
  return a.troops.reduce((sum, troop) => sum + troop.count, 0)
    - b.troops.reduce((sum, troop) => sum + troop.count, 0);
}

/** Bounded search, using real simulated outcomes; tier is value priority, not currency. */
export function buildDispatchedTroops(
  troops: TroopUnit[], profile: PlayerProfile, target: MonsterTarget,
  captain: Captain, sendDragon: boolean, searchBudget = 640
): DispatchedTroop[] {
  troops = troops.filter(isOwnTroop);
  const seeds: DispatchedTroop[][] = [];
  const initial = buildInitialDispatchedTroops(troops, profile, target, captain, sendDragon, seeds);
  const enemies = (target.enemySquads || []).filter((enemy) => enemy.count > 0);
  if (enemies.length === 0) return initial;

  const isRare = target.attackMode === 'rare';
  const isCommon = target.attackMode === 'common';
  const validLimit = (value: number) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const limits = {
    regular: validLimit(profile.maxMarchCapacity ?? target.marchCapacities?.guards ?? (isRare ? 5250 : isCommon ? 2725 : 2000)),
    mercenary: validLimit(profile.mercenaryCapacity ?? target.marchCapacities?.mercenaries ?? (isRare ? 2520 : isCommon ? 1340 : 1000)),
    monster: validLimit(profile.specialCapacity ?? target.marchCapacities?.monsters ?? (isRare ? 1260 : isCommon ? 670 : 500)),
  };
  const group = (troop: { category?: string }) => troop.category === 'mercenary' ? 'mercenary'
    : troop.category === 'monster' ? 'monster' : 'regular';
  const available = [...new Map(troops.filter((troop) => troop.isUnlocked !== false && troop.ownedCount > 0)
    .map((troop) => [troop.id, troop])).values()];
  const pool = available.map((troop): DispatchedTroop => ({
    id: troop.id, name: troop.name, tier: troop.tier, troopClass: troop.troopClass,
    baseAttack: troop.customAttack || troop.baseAttack, initiative: troop.initiative,
    traits: getTargetTraits(troop), category: troop.category,
    isMercenary: troop.category === 'mercenary', leadershipCost: Math.max(1, troop.leadershipCost || 1),
    count: Math.min(Math.floor(troop.ownedCount), Math.floor(limits[group(troop)] / Math.max(1, troop.leadershipCost || 1))),
    ...calculateUnitCombatStats(troop, profile, captain, 0, sendDragon ? 15 : 0, target.type === 'epic_monster'),
    aspects: troop.aspects, avatarIcon: troop.avatarIcon || troop.id,
  })).filter((troop) => troop.count > 0);

  const budget = Math.max(16, Math.min(640, Math.floor(searchBudget) || 640));
  let evaluationLimit = budget;
  const seen = new Set<string>();
  let evaluations = 0;
  let best: FormationCandidate | undefined;
  let beam: FormationCandidate[] = [];
  const evaluate = (proposal: DispatchedTroop[]) => {
    if (evaluations >= evaluationLimit) return;
    const remaining = { ...limits };
    const counts = new Map(proposal.map((troop) => [troop.id, troop.count]));
    const legal = pool.flatMap((troop) => {
      const key = group(troop);
      const count = Math.min(troop.count, Math.max(0, Math.floor(counts.get(troop.id) || 0)),
        Math.floor(remaining[key] / troop.leadershipCost!));
      remaining[key] -= count * troop.leadershipCost!;
      return count > 0 ? [{ ...troop, count }] : [];
    });
    const key = legal.map((troop) => `${troop.id}:${troop.count}`).join('|');
    if (seen.has(key)) return;
    seen.add(key);
    evaluations++;
    const candidate = { troops: legal, result: simulateCombat(legal, enemies) };
    if (!best || compareFormations(candidate, best) < 0) best = candidate;
    beam = [...beam, candidate].sort(compareFormations).slice(0, 4);
  };

  // Small inventories are fully enumerated. Larger ones use diversified seeds and local search.
  evaluate(initial);
  seeds.forEach(evaluate);
  const combinations = pool.reduce((product, troop) => product * (troop.count + 1), 1);
  if (combinations <= budget - 1) {
    const enumerate = (index: number, proposal: DispatchedTroop[]) => {
      if (index === pool.length) { evaluate(proposal); return; }
      for (let count = 0; count <= pool[index].count; count++) {
        enumerate(index + 1, [...proposal, { ...pool[index], count }]);
      }
    };
    enumerate(0, []);
    return best?.troops || [];
  }
  const fill = (order: DispatchedTroop[]) => {
    const remaining = { ...limits };
    return order.map((troop) => {
      const key = group(troop);
      const count = Math.min(troop.count, Math.floor(remaining[key] / troop.leadershipCost!));
      remaining[key] -= count * troop.leadershipCost!;
      return { ...troop, count };
    });
  };
  evaluate(fill(pool));
  evaluate(fill([...pool].sort((a, b) => a.tier - b.tier)));
  evaluate(fill([...pool].sort((a, b) => b.tier - a.tier)));
  evaluate(fill([...pool].sort((a, b) => b.unitAttack / b.leadershipCost! - a.unitAttack / a.leadershipCost!)));
  for (const troop of pool) evaluate([troop]);
  for (let round = 0; round < 3 && evaluations < evaluationLimit; round++) {
    const parents = [...beam];
    for (const parent of parents) {
      for (const troop of pool) {
        const current = parent.troops.find((entry) => entry.id === troop.id)?.count || 0;
        const free = limits[group(troop)] - parent.troops.filter((entry) => group(entry) === group(troop))
          .reduce((sum, entry) => sum + entry.count * entry.leadershipCost!, 0);
        const maximum = Math.min(troop.count, current + Math.floor(free / troop.leadershipCost!));
        const incoming = enemies.reduce((sum, enemy) => sum + enemy.unitAttack * enemy.count
          * (1 + getAspectBonusAgainstTarget(enemy.aspects, troop.troopClass, troop.traits) / 100), 0);
        const strongestHealth = Math.max(0, ...parent.troops.filter((entry) => entry.id !== troop.id)
          .map((entry) => entry.unitHealth * entry.count));
        const choices = new Set([0, 1, current - 1, current + 1, maximum,
          Math.floor(current / 2), Math.floor(maximum / 4), Math.floor(maximum / 2), Math.floor(maximum * 3 / 4),
          Math.floor(incoming / troop.unitHealth) + 1, Math.floor(strongestHealth / troop.unitHealth) + 1]);
        for (const count of choices) {
          if (count < 0 || count > maximum || count === current) continue;
          evaluate([...parent.troops.filter((entry) => entry.id !== troop.id), { ...troop, count }]);
        }
        // Replace a competing stack, allowing exploration even when its capacity is full.
        for (const other of parent.troops.filter((entry) => entry.id !== troop.id && group(entry) === group(troop))) {
          evaluate(fill([troop, ...parent.troops.filter((entry) => entry.id !== other.id && entry.id !== troop.id)]));
        }
      }
    }
  }
  // Keep every candidate from the original bounded search. Then verify at most one
  // removal per troop type, so cleanup cannot displace a better candidate or go unbounded.
  evaluationLimit = budget + pool.length;
  const finalStackIds = best?.troops.map(troop => troop.id) || [];
  for (const id of finalStackIds) {
    if (!best || evaluations >= evaluationLimit) break;
    evaluate(best.troops.filter(troop => troop.id !== id));
  }
  return best?.troops || [];
}

/**
 * Encontra o nível ótimo para farmar XP e subir de nível mais rápido:
 * O nível mais alto encontrado na busca limitada com vitória sem perdas previstas.
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
  zeroLossesInModel: boolean;
  canBeatAnyLevel: boolean;
} {
  const maxAvailable = Math.max(...(template.availableLevels || [template.defaultLevel]), template.defaultLevel);
  const maxLevelToTest = Math.min(45, Math.max(30, maxAvailable));

  let bestLevel = 1;
  let bestXp = 0;
  let foundSafe = false;
  let firstVictory: { level: number; xp: number } | undefined;

  for (let lvl = maxLevelToTest; lvl >= 1; lvl--) {
    const target = buildMonsterTargetFromTemplate(template, lvl);
    if (!target.enemySquads || target.enemySquads.length === 0) continue;
    const dispatched = buildDispatchedTroops(troops, profile, target, captain, sendDragon, 96);
    if (dispatched.length === 0) continue;

    const sim = simulateCombat(dispatched, target.enemySquads || []);
    if (sim.outcome === 'VICTORY' && !firstVictory) firstVictory = { level: lvl, xp: target.xpReward || 0 };

    if (sim.outcome === 'VICTORY' && sim.playerCasualties.every((loss) => loss.lostCount === 0)) {
      bestLevel = lvl;
      bestXp = target.xpReward || 0;
      foundSafe = true;
      break;
    }
  }

  return {
    optimalLevel: foundSafe ? bestLevel : firstVictory?.level || 1,
    optimalXp: foundSafe ? bestXp : firstVictory?.xp || 0,
    // Real-battle fidelity is still failing; zero simulated losses are not validated safety.
    isSafe: false,
    zeroLossesInModel: foundSafe,
    canBeatAnyLevel: Boolean(firstVictory),
  };
}
