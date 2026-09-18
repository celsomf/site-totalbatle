import { MarchSquadAllocation, MonsterTarget, Captain } from '../types';

export interface CombatSimulationResult {
  victory: boolean;
  combatRounds: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  resolvedSquads: MarchSquadAllocation[];
  log: string[];
}

/**
 * Simulates round-by-round damage exchange against the monster.
 */
export function simulateCombat(
  squads: MarchSquadAllocation[],
  captain: Captain,
  target: MonsterTarget
): CombatSimulationResult {
  let monsterCurrentHealth = target.customHealthOverride || target.totalHealth;
  const monsterAttack = target.customAttackOverride || target.baseAttack;

  const resolvedSquads: MarchSquadAllocation[] = squads.map((s) => ({ ...s, expectedLosses: 0 }));
  const log: string[] = [];
  let round = 1;
  const maxRounds = 10;

  log.push(`Iniciando combate contra ${target.name} (Nível ${target.level}, HP: ${monsterCurrentHealth.toLocaleString('pt-BR')})`);

  while (monsterCurrentHealth > 0 && round <= maxRounds) {
    log.push(`--- Round ${round} ---`);

    // 1. Monster Attacks (Targeting squad with highest HP or fodder priority)
    const activeFodder = resolvedSquads.filter((s) => s.role === 'fodder' && s.expectedLosses < s.count);
    
    if (activeFodder.length > 0) {
      // Monster hits the first available fodder stack
      const targetStack = activeFodder[0];
      targetStack.expectedLosses = targetStack.count; // Absorb full hit
      log.push(`Monstro desferiu golpe de ${monsterAttack.toLocaleString('pt-BR')} no esquadrão de sacrifício [${targetStack.unitName}].`);
    } else {
      // Monster hits core squad if no fodder remains
      const coreSquad = resolvedSquads.find((s) => s.role === 'primary_damage');
      if (coreSquad) {
        const casualties = Math.min(coreSquad.count, Math.ceil(monsterAttack / (coreSquad.totalSquadHealth / (coreSquad.count || 1))));
        coreSquad.expectedLosses = Math.min(coreSquad.count, coreSquad.expectedLosses + casualties);
        log.push(`Aviso: Sem buchas ativas! Monstro atingiu [${coreSquad.unitName}] causando ${casualties} baixas.`);
      }
    }

    // 2. Player Squads Attack
    let roundPlayerDamage = 0;
    for (const squad of resolvedSquads) {
      const survivingRatio = (squad.count - squad.expectedLosses) / squad.count;
      if (survivingRatio > 0) {
        const squadDmg = Math.round(squad.totalSquadAttack * survivingRatio);
        roundPlayerDamage += squadDmg;
      }
    }

    monsterCurrentHealth = Math.max(0, monsterCurrentHealth - roundPlayerDamage);
    log.push(`Exército causou ${roundPlayerDamage.toLocaleString('pt-BR')} de dano. Vida restante do monstro: ${monsterCurrentHealth.toLocaleString('pt-BR')}.`);

    if (monsterCurrentHealth <= 0) {
      log.push(`Vitória! ${target.name} derrotado no Round ${round}.`);
      break;
    }

    round++;
  }

  const victory = monsterCurrentHealth <= 0;

  return {
    victory,
    combatRounds: Math.min(round, maxRounds),
    totalDamageDealt: target.totalHealth - monsterCurrentHealth,
    totalDamageTaken: resolvedSquads.reduce((sum, s) => sum + s.expectedLosses, 0),
    resolvedSquads,
    log,
  };
}
