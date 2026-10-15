import { expect, it } from 'vitest';
import { compareCasualtyEstimate } from '../src/domain/estimateComparison';

it('distingue39,69% acima do real de28,41% abaixo da previsão', () => {
  const comparison = compareCasualtyEstimate(2242, 1605);
  expect(comparison.direction).toBe('above');
  expect(comparison.difference).toBe(637);
  expect(comparison.percentRelativeToObserved).toBeCloseTo(39.68847, 4);
  expect(comparison.observedReductionRelativeToEstimate).toBeCloseTo(28.41213, 4);
});

it('não presume viés conservador e trata observação zero sem divisão por zero', () => {
  expect(compareCasualtyEstimate(382, 1605).direction).toBe('below');
  expect(compareCasualtyEstimate(0, 0).percentRelativeToObserved).toBeNull();
  expect(compareCasualtyEstimate(0, 0).observedReductionRelativeToEstimate).toBeNull();
  expect(compareCasualtyEstimate(10, 0).difference).toBe(10);
});
