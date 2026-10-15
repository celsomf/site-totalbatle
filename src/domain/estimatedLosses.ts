/** Unweighted troop count. Captains/dragon are not dispatched troop stacks. */
export function getEstimatedLosses(
  sent: ReadonlyArray<{ count: number }>,
  casualties: ReadonlyArray<{ lostCount: number }>,
) {
  const count = (value: number) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const totalSent = sent.reduce((sum, unit) => sum + count(unit.count), 0);
  const totalLost = Math.min(totalSent, casualties.reduce((sum, unit) => sum + count(unit.lostCount), 0));
  return { totalSent, totalLost, percent: totalSent > 0 ? totalLost / totalSent * 100 : null };
}
