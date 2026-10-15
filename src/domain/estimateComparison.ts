/** Compare a saved estimate to an observation; never modify the simulation or apply a fitted margin. */
export function compareCasualtyEstimate(estimated: number, observed: number) {
  const difference = estimated - observed;
  return {
    difference,
    direction: difference > 0 ? 'above' as const : difference < 0 ? 'below' as const : 'equal' as const,
    percentRelativeToObserved: observed > 0 ? difference / observed * 100 : null,
    observedReductionRelativeToEstimate: estimated > 0 ? difference / estimated * 100 : null,
  };
}
