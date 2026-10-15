// Approximate conservative acceptance for this observed case, never a global correction factor.
import { expect, it } from 'vitest';
import fixture from './fixtures/observed-cursed-battle.json';
import { simulateCombat } from '../src/utils/combatSimulator';
import type { DispatchedTroop } from '../src/utils/combatSimulator';
import type { EnemySquadUnit } from '../src/types';

const result = () => simulateCombat(fixture.troops as DispatchedTroop[], fixture.enemies as EnemySquadUnit[]);

it('preserva formação2703, previsão histórica382 e observação real1605 sem dados pessoais', () => {
  expect(fixture.troops.reduce((sum, unit) => sum + unit.count, 0)).toBe(2703);
  expect(fixture.historical.losses.reduce((sum, unit) => sum + unit.lostCount, 0)).toBe(382);
  expect(fixture.observed.losses.reduce((sum, unit) => sum + unit.lostCount, 0)).toBe(1605);
  expect(fixture.observed.firstFive[0]).toMatchObject({ damage: 864000, killed: 43 });
  expect(fixture.observed.firstFive[4]).toMatchObject({ damage: 533650, killed: 494 });
});

it('mantém vitória observada e não subestima baixas neste caso aceito, sem inflar mortes', () => {
  const simulation = result();
  const sent = fixture.troops.reduce((sum, unit) => sum + unit.count, 0);
  const estimated = simulation.playerCasualties.reduce((sum, unit) => sum + unit.lostCount, 0);
  expect(simulation.outcome).toBe(fixture.observed.outcome);
  expect(estimated).toBeGreaterThanOrEqual(fixture.observed.totalDeaths);
  expect(estimated).toBeLessThanOrEqual(sent);
  for (const unit of simulation.playerCasualties) expect(unit.lostCount).toBeLessThanOrEqual(unit.initialCount);
  // No fitted tolerance or loss-inflation coefficient is applied.
});

it('confere os cinco primeiros atacantes e alvos com o relatório observado', () => {
  const names = new Map([...fixture.troops, ...fixture.enemies].map(unit => [unit.id, unit.name]));
  const actualOrder = fixture.observed.firstFive.map(hit => [names.get(hit.attacker), names.get(hit.defender)]);
  expect(result().rounds.slice(0, 5).map(hit => [hit.attackerName, hit.defenderName])).toEqual(actualOrder);
});

it('preserva dano inicial conferido e registra estimativas como experimentais', () => {
  expect(result().rounds[0].damageDealt).toBe(864000);
  expect(result().model?.validationStatus).toBe('experimental');
  expect(result().rounds.every(hit => Number.isFinite(hit.damageDealt) && hit.damageDealt >= 0)).toBe(true);
});
