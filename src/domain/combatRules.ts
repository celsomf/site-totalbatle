import type { TroopAspects, TroopClass, TroopTrait } from '../types';

export const COMBAT_ENGINE_VERSION = '2026-10-15-official-turns-additive-aspects';
export const COMBAT_VALIDATION_STATUS = 'experimental' as const;

export interface DamageActor {
  unitAttack: number;
  /** Base strength is kept separate so target aspects do not multiply account bonuses. */
  baseAttack?: number;
  currentCount: number;
}

export function calculateHitDamage(actor: DamageActor, targetBonusPercent: number): number {
  const base = actor.baseAttack ?? actor.unitAttack;
  return Math.max(0, Math.round(actor.currentCount * (actor.unitAttack + base * targetBonusPercent / 100)));
}

export interface TargetableSquad {
  id: string;
  troopClass: TroopClass;
  traits?: TroopTrait[];
  aspects?: TroopAspects;
  currentCount: number;
  unitHealth: number;
  residualDamage: number;
}

/** Official video00:47–01:22: maximize damage that can actually be dealt, capped by remaining health. */
export function selectDamageTarget<T extends TargetableSquad>(targets: T[], damage: (target: T) => number): T | undefined {
  return targets.filter(target => target.currentCount > 0).sort((a, b) => {
    const health = (target: T) => Math.max(0, target.unitHealth * target.currentCount - target.residualDamage);
    return Math.min(damage(b), health(b)) - Math.min(damage(a), health(a))
      || health(b) - health(a) || a.id.localeCompare(b.id);
  })[0];
}

/** Official video00:38: strength with active bonuses, excluding target-specific aspects. */
export function strongestAvailable<T extends { id: string; currentCount: number; unitAttack: number }>(units: T[]): T | undefined {
  return [...units].filter(unit => unit.currentCount > 0).sort((a, b) => b.currentCount * b.unitAttack - a.currentCount * a.unitAttack || a.id.localeCompare(b.id))[0];
}
