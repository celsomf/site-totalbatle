import { expect, it } from 'vitest';
import { getEstimatedLosses } from '../src/domain/estimatedLosses';

it('conta unidades sem ponderar liderança ou nível e acompanha nova composição', () => {
  const sent = [{ count: 1648 }, { count: 170 }, { count: 662 }, { count: 15 }, { count: 134 }, { count: 20 }, { count: 1 }];
  const original = getEstimatedLosses(sent, [{ lostCount: 803 }, { lostCount: 112 }]);
  expect(original.totalSent).toBe(2650);
  expect(original.totalLost).toBe(915);
  expect(original.percent).toBeCloseTo(34.5283, 4);
  const changed = getEstimatedLosses(sent.slice(0, -1), [{ lostCount: 818 }, { lostCount: 31 }, { lostCount: 113 }]);
  expect(changed.totalSent).toBe(2649);
  expect(changed.percent).toBeCloseTo(36.3156, 4);
});

it('trata ausência de tropas, vitória sem baixas e derrota total', () => {
  expect(getEstimatedLosses([], []).percent).toBeNull();
  expect(getEstimatedLosses([{ count: 10 }], []).percent).toBe(0);
  expect(getEstimatedLosses([{ count: 10 }], [{ lostCount: 10 }]).percent).toBe(100);
  expect(getEstimatedLosses([{ count: NaN }], [{ lostCount: Infinity }]).percent).toBeNull();
});
