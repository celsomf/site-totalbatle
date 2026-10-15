import { Captain, CaptainBonusDefinition, CaptainBonusTarget, TroopUnit } from '../types';
import definitions from '../data/combatCaptainDefinitions.json';

const combatDefinitions = definitions as Record<string, Pick<Captain, 'bonuses' | 'avatarIcon'>>;

/** Scoped combat definitions keep unrelated roster/UI edits outside the combat commit. */
export function getCombatCaptainDefinition(captain: Captain): Captain {
  const known = combatDefinitions[captain.id];
  return { ...captain, bonuses: captain.bonuses ?? known?.bonuses,
    avatarIcon: captain.avatarIcon.startsWith('/') ? captain.avatarIcon : known?.avatarIcon || captain.avatarIcon };
}


export interface CaptainComputedAbility {
  stat: CaptainBonusDefinition['stat'];
  label: string;
  target?: CaptainBonusTarget;
  percent: number | null;
  formatted: string;
  color: string;
}

export interface CaptainComputedBonus {
  /** Bônus de combate para tropas do capitão, mantidos por compatibilidade. */
  monsterAttackBonusPercent: number;
  marchSpeedBonusPercent: number;
  cryptTarReductionPercent: number;
  valorPointsBonusPercent: number;
  abilities: CaptainComputedAbility[];
  primaryBonusLabel: string;
  primaryBonusFormatted: string;
  primaryBonusColor: string;
}

export interface CaptainCombatBonus {
  strengthPercent: number;
  healthPercent: number;
}

const DEFAULT_LEVEL_CAP = 600;

function getAbilityValue(
  bonus: CaptainBonusDefinition,
  level: number,
  stars: number
): number | null {
  if (bonus.perLevelPercent === undefined || !bonus.starBonusByLevel) return null;
  const safeLevel = Math.max(1, Math.floor(Number.isFinite(level) ? level : 1));
  const safeStars = Math.max(1, Math.min(7, Math.floor(Number.isFinite(stars) ? stars : 1)));
  const cappedLevel = Math.min(bonus.levelCap ?? DEFAULT_LEVEL_CAP, safeLevel);
  return Number((cappedLevel * bonus.perLevelPercent + (bonus.starBonusByLevel[safeStars] || 0)).toFixed(1));
}

function getAbilityColor(stat: CaptainBonusDefinition['stat']): string {
  if (stat === 'strength' || stat === 'health') return 'text-emerald-400';
  if (stat === 'valor_points') return 'text-blue-400';
  if (stat === 'conquest_points') return 'text-amber-400';
  if (stat === 'march_speed' || stat === 'march_distance') return 'text-cyan-400';
  return 'text-indigo-400';
}

export function getCaptainAbilityBonuses(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): CaptainComputedAbility[] {
  return (getCombatCaptainDefinition(captain).bonuses || []).map((bonus) => {
    const percent = getAbilityValue(bonus, level, stars);
    const sign = percent === null || percent < 0 ? '' : '+';
    return {
      stat: bonus.stat,
      label: bonus.label,
      target: bonus.target,
      percent,
      formatted: percent === null ? `${bonus.label} · valor não catalogado` : `${sign}${percent.toFixed(1)}% ${bonus.label}`,
      color: getAbilityColor(bonus.stat),
    };
  });
}

function troopMatchesTarget(troop: TroopUnit, target: CaptainBonusTarget | undefined, vsEpicMonster: boolean): boolean {
  if (!target || target === 'all') return true;

  switch (target) {
    case 'guardsmen': return troop.category === 'guardsman' || troop.aspects?.receivesGuardsmenBonuses === true;
    case 'specialists': return troop.category === 'specialist';
    case 'engineers': return troop.troopClass === 'siege' || /engineer|engenh/i.test(`${troop.id} ${troop.name}`);
    case 'monsters': return troop.category === 'monster';
    case 'melee':
    case 'ranged':
    case 'mounted':
    case 'flying':
    case 'siege': return troop.troopClass === target;
    case 'scouts': return /scout|batedor|explorador/i.test(`${troop.id} ${troop.name}`);
    case 'epic_monsters': return vsEpicMonster;
    case 'group_marches': return false;
    default: return false;
  }
}

export function getCaptainCombatBonusForTroop(
  captain: Captain,
  level: number,
  stars: number,
  troop: TroopUnit,
  vsEpicMonster = false
): CaptainCombatBonus {
  let strengthPercent = 0;
  let healthPercent = 0;

  for (const ability of getCaptainAbilityBonuses(captain, level, stars)) {
    if (ability.percent === null || !troopMatchesTarget(troop, ability.target, vsEpicMonster)) continue;
    if (ability.stat === 'strength') strengthPercent += ability.percent;
    if (ability.stat === 'health') healthPercent += ability.percent;
  }

  return {
    strengthPercent: Number(strengthPercent.toFixed(1)),
    healthPercent: Number(healthPercent.toFixed(1)),
  };
}

/** Compatibilidade: retorna apenas força geral ou força específica de monstros. */
export function getCaptainMonsterAttackBonus(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): number {
  return getCaptainAbilityBonuses(captain, level, stars)
    .filter((ability) => ability.stat === 'strength' && (ability.target === 'all' || ability.target === 'monsters'))
    .reduce((sum, ability) => sum + (ability.percent || 0), 0);
}

export function getCaptainSpeedBonus(captain: Captain, level: number = 1, stars: number = 1): number {
  return getCaptainAbilityBonuses(captain, level, stars)
    .filter((ability) => ability.stat === 'march_speed')
    .reduce((sum, ability) => sum + (ability.percent || 0), 0);
}

/** Carter concede eficiência e capacidade de alcatrão, não desconto no custo da cripta. */
export function getCaptainCryptTarReduction(
  _captain: Captain,
  _level: number = 1,
  _stars: number = 1
): number {
  return 0;
}

export function getCaptainValorBonus(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): number {
  return getCaptainAbilityBonuses(captain, level, stars)
    .filter((ability) => ability.stat === 'valor_points')
    .reduce((sum, ability) => sum + (ability.percent || 0), 0);
}

export function getCaptainConquestBonus(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): number {
  return getCaptainAbilityBonuses(captain, level, stars)
    .filter((ability) => ability.stat === 'conquest_points')
    .reduce((sum, ability) => sum + (ability.percent || 0), 0);
}

export function getCaptainComputedStats(
  captain: Captain,
  level: number = 1,
  stars: number = 1
): CaptainComputedBonus {
  const abilities = getCaptainAbilityBonuses(captain, level, stars);
  const primary = abilities[0];

  return {
    monsterAttackBonusPercent: getCaptainMonsterAttackBonus(captain, level, stars),
    marchSpeedBonusPercent: getCaptainSpeedBonus(captain, level, stars),
    cryptTarReductionPercent: 0,
    valorPointsBonusPercent: getCaptainValorBonus(captain, level, stars),
    abilities,
    primaryBonusLabel: primary?.label || 'Bônus próprio',
    primaryBonusFormatted: primary?.formatted || 'Sem bônus próprio cadastrado',
    primaryBonusColor: primary?.color || 'text-slate-400',
  };
}

/** Garvel e Julia são avatares básicos; não concedem bônus próprio por nível. */
export function getHeroAttackBonus(_heroLevel: number = 1): number {
  return 0;
}

/** Liderança vem dos atributos exibidos no jogo e não pode ser inferida pelo nível. */
export function getHeroLeadershipBonus(_heroLevel: number = 1): number {
  return 0;
}
