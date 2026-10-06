import type { MonsterTarget, TroopClass } from '../types';
import type { MonsterPresetTemplate } from '../data/monsters';

export function buildMonsterTargetFromTemplate(
  template: MonsterPresetTemplate,
  level: number
): MonsterTarget {
  const validLevel = Math.max(1, Math.min(45, Math.floor(level)));
  const squads = template.generateSquads(validLevel);
  const rewards = template.calculateRewards(validLevel);
  const capacities = template.marchCapacities(validLevel, template.attackMode);
  const classesPresent = squads.map((squad) => squad.troopClass);
  const weaknesses: TroopClass[] = [];
  if (classesPresent.includes('ranged')) weaknesses.push('mounted');
  if (classesPresent.includes('mounted')) weaknesses.push('melee');
  if (classesPresent.includes('flying')) weaknesses.push('ranged');
  if (classesPresent.includes('melee')) weaknesses.push('ranged');

  return {
    id: `${template.id}_lvl_${validLevel}`,
    name: `${template.name} (Nível ${validLevel})`,
    type: template.targetType,
    attackMode: template.attackMode,
    faction: template.faction,
    level: validLevel,
    totalHealth: squads.reduce((total, squad) => total + squad.unitHealth * squad.count, 0),
    baseAttack: squads.reduce((total, squad) => total + squad.unitAttack * squad.count, 0),
    squadCount: squads.length,
    weaknessClasses: Array.from(new Set(weaknesses)),
    enemySquads: squads,
    xpReward: rewards.xp,
    valorReward: rewards.vp,
    tarReward: rewards.tar,
    marchCapacities: capacities,
    estimatedValorPoints: rewards.vp,
    estimatedCaptainXP: rewards.xp,
    estimatedChestPoints: rewards.chest || 10,
    description: template.description,
    isCustomConfig: squads.length > 0,
  };
}

export function updateMonsterTarget(target: MonsterTarget, squads: MonsterTarget['enemySquads'] = []): MonsterTarget {
  const classes = squads.map((squad) => squad.troopClass);
  const weaknesses: TroopClass[] = [];
  if (classes.includes('ranged')) weaknesses.push('mounted');
  if (classes.includes('mounted')) weaknesses.push('melee');
  if (classes.includes('flying') || classes.includes('melee')) weaknesses.push('ranged');
  return {
    ...target,
    enemySquads: squads,
    totalHealth: squads.reduce((total, squad) => total + squad.unitHealth * squad.count, 0),
    baseAttack: squads.reduce((total, squad) => total + squad.unitAttack * squad.count, 0),
    squadCount: squads.length,
    weaknessClasses: Array.from(new Set(weaknesses)),
    isCustomConfig: squads.length > 0,
    activeVariantId: undefined,
    activeVariantName: undefined,
  };
}
