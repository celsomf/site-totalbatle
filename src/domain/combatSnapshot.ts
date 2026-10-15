import type { Captain, CombatSimulationResult, EnemySquadUnit, PlayerProfile, TroopUnit } from '../types';
import type { DispatchedTroop } from '../utils/combatSimulator';
import { simulateCombat } from '../utils/combatSimulator';
import { COMBAT_ENGINE_VERSION } from './combatRules';
import { getCombatCaptainDefinition } from '../utils/combatCaptainStats';

export interface CombatSimulationSnapshot {
  schemaVersion: 1;
  engineVersion: string;
  createdAt: string;
  validationStatus: 'experimental';
  lossPriority: string[];
  captain: { definition: Captain; level: number; stars: number; starsSource: 'profile' | 'fallback' };
  dragon: { sent: boolean; profileLevel: number; assumedAttackBonusPercent: number; bonusVerified: false };
  capacities: { guards: number; mercenaries: number; monsters: number };
  profileInputs: { academyBonus: PlayerProfile['academyBonus']; heroGeneralAttackPercent: number; captainGeneralAttackPercent: number };
  sourceTroops: TroopUnit[];
  dispatchedTroops: DispatchedTroop[];
  enemies: EnemySquadUnit[];
  result: CombatSimulationResult;
}

export function createCombatSnapshot(input: {
  profile: PlayerProfile; captain: Captain; sendDragon: boolean; troops: TroopUnit[];
  dispatchedTroops: DispatchedTroop[]; enemies: EnemySquadUnit[]; result: CombatSimulationResult;
  capacities: CombatSimulationSnapshot['capacities']; createdAt?: string;
}): CombatSimulationSnapshot {
  const { profile, captain } = input;
  const snapshot: CombatSimulationSnapshot = {
    schemaVersion: 1, engineVersion: COMBAT_ENGINE_VERSION, createdAt: input.createdAt || new Date().toISOString(), validationStatus: 'experimental',
    lossPriority: ['victory', 'monsters-and-mercenaries-by-descending-tier', 'regular-troops-by-descending-tier', 'sent-count'],
    captain: { definition: getCombatCaptainDefinition(captain), level: profile.captainLevels[captain.id] || captain.level || 1,
      stars: profile.captainStars?.[captain.id] || captain.stars || 1, starsSource: profile.captainStars?.[captain.id] ? 'profile' : 'fallback' },
    dragon: { sent: input.sendDragon, profileLevel: profile.dragonLevel, assumedAttackBonusPercent: input.sendDragon ? 15 : 0, bonusVerified: false },
    capacities: input.capacities,
    profileInputs: { academyBonus: profile.academyBonus, heroGeneralAttackPercent: profile.heroGeneralAttackPercent || 0, captainGeneralAttackPercent: profile.captainGeneralAttackPercent?.[captain.id] || 0 },
    sourceTroops: input.troops.filter(unit => input.dispatchedTroops.some(sent => sent.id === unit.id)),
    dispatchedTroops: input.dispatchedTroops, enemies: input.enemies, result: input.result,
  };
  // JSON-safe deep copy prevents later edits to stock, target or captain from changing history.
  return JSON.parse(JSON.stringify(snapshot));
}

export function replayCombatSnapshot(snapshot: CombatSimulationSnapshot): CombatSimulationResult {
  if (snapshot.schemaVersion !== 1 || snapshot.engineVersion !== COMBAT_ENGINE_VERSION) throw new Error('Versão do motor diferente. Consulte o resultado original salvo; não recalcular silenciosamente.');
  return simulateCombat(snapshot.dispatchedTroops, snapshot.enemies);
}
