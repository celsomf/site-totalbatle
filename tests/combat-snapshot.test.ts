import { expect, it } from 'vitest';
import { createCombatSnapshot, replayCombatSnapshot } from '../src/domain/combatSnapshot';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';
import { DEFAULT_CAPTAINS } from '../src/data/captains';
import captured from './fixtures/observed-cursed-battle.json';
import { simulateCombat } from '../src/utils/combatSimulator';
import type { DispatchedTroop } from '../src/utils/combatSimulator';
import type { EnemySquadUnit, TroopUnit, ActiveMarch } from '../src/types';

it('preserva contexto completo independente de edições posteriores e permite reprodução por JSON', () => {
  const profile = createCleanProfile('snapshot-test');
  const captain = DEFAULT_CAPTAINS.find(entry => entry.id === 'bernard')!;
  const sent = structuredClone(captured.troops) as DispatchedTroop[];
  const enemies = structuredClone(captured.enemies) as EnemySquadUnit[];
  const sources = structuredClone(captured.troops).map(unit => ({ ...unit, ownedCount: unit.count,
    isUnlocked: true, revivalSilverCost: 0, leadershipCost: unit.leadershipCost || 1 })) as TroopUnit[];
  const result = simulateCombat(sent, enemies);
  const snapshot = createCombatSnapshot({ profile, captain, sendDragon: true, troops: sources, dispatchedTroops: sent, enemies, result,
    capacities: { guards: 4444, mercenaries: 2212, monsters: 1101 }, createdAt: '2026-10-15T17:21:52.899Z' });
  const json = JSON.stringify(snapshot);
  profile.academyBonus.monstersHealth = 999;
  sent[0].count = 0; enemies[0].count = 1; sources[0].baseAttack = 999;
  expect(JSON.stringify(snapshot)).toBe(json);
  expect(replayCombatSnapshot(JSON.parse(json))).toEqual(result);
  expect(snapshot.sourceTroops.length).toBe(7);
  expect(snapshot.result.rounds.length).toBeGreaterThan(0);
  expect(snapshot.validationStatus).toBe('experimental');
});

it('não recalcula silenciosamente versão diferente e mantém histórico antigo compatível', () => {
  expect(() => replayCombatSnapshot({ schemaVersion: 1, engineVersion: 'old' } as Parameters<typeof replayCombatSnapshot>[0])).toThrow('Versão do motor diferente');
  const legacy: ActiveMarch = { id: 'legacy-example', targetId: 'target', targetName: 'Example', targetLevel: 1,
    createdAt: '2026-01-01T00:00:00Z', squads: [] };
  expect('simulationSnapshot' in JSON.parse(JSON.stringify(legacy))).toBe(false);
});
