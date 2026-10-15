/** Conservative model: partial damage stays on the same squad between hits. */
export function applySquadDamage(
  squad: { currentCount: number; unitHealth: number; residualDamage: number },
  damage: number
): { currentCount: number; residualDamage: number; casualties: number } {
  const accumulatedDamage = squad.residualDamage + Math.max(0, damage);
  const casualties = Math.min(squad.currentCount, Math.max(0, Math.floor(accumulatedDamage / squad.unitHealth)));
  const currentCount = squad.currentCount - casualties;
  return { currentCount, casualties,
    residualDamage: currentCount > 0 ? accumulatedDamage - casualties * squad.unitHealth : 0 };
}
