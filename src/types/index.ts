import type { CombatSimulationSnapshot } from '../domain/combatSnapshot';
export type TroopCategory = 'guardsman' | 'specialist' | 'monster' | 'mercenary';
export type TroopClass = 'melee' | 'ranged' | 'mounted' | 'flying' | 'siege';
export type TroopTrait = 'beast' | 'giant' | 'dragon' | 'elemental' | 'fortification' | 'human' | 'epic';

export interface TroopAspects {
  bonusVsEpicMonstersPercent?: number;
  receivesGuardsmenBonuses?: boolean;
  combatClassUnverified?: boolean;
  revivalCostsUnverified?: boolean;
  bonusVsMeleePercent?: number;
  bonusVsRangedPercent?: number;
  bonusVsMountedPercent?: number;
  bonusVsFlyingPercent?: number;
  bonusVsSiegePercent?: number;
  bonusVsBeastsPercent?: number;
  bonusVsGiantsPercent?: number;
  bonusVsDragonsPercent?: number;
  bonusVsElementalsPercent?: number;
  bonusVsFortificationsPercent?: number;
  bonusVsHumanPercent?: number;
  isPvpDoubled?: boolean;
  nativeCriticalPercent?: number;
}

export interface TroopUnit {
  id: string;
  name: string;
  category: TroopCategory;
  tier: number;
  troopClass: TroopClass;
  initiative?: number;
  traits?: TroopTrait[];
  baseAttack: number;
  baseHealth: number;
  customAttack?: number;
  customHealth?: number;
  ownedCount: number;          // Quantidade de tropas que o jogador possui no quartel/marcha
  revivalSilverCost: number;
  revivalGoldCost?: number;
  leadershipCost: number;
  speed?: number;
  capacity?: number;
  foodConsumption?: number;
  aspects?: TroopAspects;
  isUnlocked: boolean;
  avatarIcon?: string;
  avatarPath?: string;
  catalogManaged?: boolean;
}

export type CaptainSpecialty = 'monsters' | 'crypts' | 'pvp' | 'economy' | 'speed' | 'valor' | 'conquest';

export type CaptainBonusStat =
  | 'strength'
  | 'health'
  | 'crypt_efficiency'
  | 'tar_capacity'
  | 'valor_points'
  | 'conquest_points'
  | 'march_speed'
  | 'march_distance'
  | 'construction_speed'
  | 'research_speed'
  | 'training_speed'
  | 'food_production'
  | 'resource_gathering'
  | 'carrying_capacity';

export type CaptainBonusTarget =
  | 'all'
  | 'guardsmen'
  | 'specialists'
  | 'engineers'
  | 'monsters'
  | 'melee'
  | 'ranged'
  | 'mounted'
  | 'flying'
  | 'siege'
  | 'scouts'
  | 'epic_monsters'
  | 'group_marches';

export interface CaptainBonusDefinition {
  stat: CaptainBonusStat;
  label: string;
  target?: CaptainBonusTarget;
  perLevelPercent?: number;
  /** Percentual acumulado em cada nível de estrela. O índice é o número de estrelas. */
  starBonusByLevel?: number[];
  levelCap?: number;
}

export interface Captain {
  id: string;
  name: string;
  level?: number;
  stars?: number;
  specialty: CaptainSpecialty;
  /** Valores legados mantidos apenas para ler perfis e testes antigos. */
  monsterAttackBonusPercent?: number;
  cryptTarReductionPercent?: number;
  marchSpeedBonusPercent?: number;
  bonuses?: CaptainBonusDefinition[];
  valorBonusPerLevelPercent?: number;
  valorBonusPerStarPercent?: number;
  valorBonusLevelCap?: number;
  description: string;
  avatarIcon: string;
}

export type TargetType = 'common_monster' | 'epic_monster' | 'crypt';
export type AttackMode = 'common' | 'rare' | 'epic';

export interface EnemySquadUnit {
  id: string;
  name: string;
  tier: number;
  troopClass: TroopClass;
  family: 'inferno' | 'cursed' | 'undead' | 'barbarian' | 'elemental' | 'epic' | 'elfos' | 'dragons';
  traits?: TroopTrait[];
  subType?: string; // Ex: 'Elfos, Unidade de longo alcance' ou 'Demônio, Unidade montada'
  unitAttack: number;
  unitHealth: number;
  leadership: number;
  initiative: number;
  count: number;
  aspects?: {
    bonusVsMeleePercent?: number;
    bonusVsRangedPercent?: number;
    bonusVsMountedPercent?: number;
    bonusVsFlyingPercent?: number;
    bonusVsElementalsPercent?: number;
    bonusVsDragonsPercent?: number;
    bonusVsSiegePercent?: number;
    bonusVsFortificationsPercent?: number;
    bonusVsBeastsPercent?: number;
    bonusVsGiantsPercent?: number;
    description?: string;
  };
  isEnemy?: boolean;
  unitType?: 'enemy_monster';
  avatarUrl?: string;
}

export interface CombatRoundStep {
  step: number;
  attackerName: string;
  attackerTier: number;
  attackerCount: number;
  defenderName: string;
  defenderTier: number;
  damageDealt: number;
  casualties: number;
  defenderRemainingCount: number;
  isEnemyAttacking: boolean;
  bonusText?: string;
}

export interface SquadCasualty {
  id: string;
  name: string;
  tier: number;
  isMercenary?: boolean;
  category?: TroopCategory;
  initialCount: number;
  lostCount: number;
  survivingCount: number;
}

export interface CombatSimulationResult {
  model?: {
    version: string;
    validationStatus: 'experimental';
    assumptions: string[];
  };
  outcome: 'VICTORY' | 'DEFEAT';
  safetyLevel: 'CLEAN_VICTORY' | 'PROTECTED_VICTORY' | 'COSTLY_VICTORY' | 'DEFEAT';
  totalPlayerDamage: number;
  totalEnemyDamage: number;
  initialEnemyHp: number;
  remainingEnemyHp: number;
  playerCasualties: SquadCasualty[];
  enemyCasualties: SquadCasualty[];
  rounds: CombatRoundStep[];
  deficitDamage?: number;
  deficitTroopsText?: string;
  recommendedTroopsNeeded?: {
    troopId: string;
    troopName: string;
    countNeeded: number;
  }[];
}

export interface MonsterTarget {
  id: string;
  name: string;
  type: TargetType;
  attackMode?: AttackMode;
  faction?: string;
  level: number;
  totalHealth: number;
  baseAttack: number;
  squadCount: number;
  weaknessClasses: TroopClass[];
  enemySquads?: EnemySquadUnit[];
  coordinates?: string;
  xpReward?: number;
  valorReward?: number;
  tarReward?: number;
  marchCapacities?: {
    guards: number;
    mercenaries: number;
    monsters: number;
  };
  customHealthOverride?: number;
  customAttackOverride?: number;
  estimatedValorPoints: number;
  estimatedChestPoints: number;
  estimatedCaptainXP: number;
  description?: string;
  isCustomConfig?: boolean;
  activeVariantId?: string;
  activeVariantName?: string;
}

export interface CustomMonsterVariant {
  id: string;
  name: string;
  squads: EnemySquadUnit[];
  createdAt?: number;
}

export interface ProfileSummary {
  id: string;
  playerName: string;
  kingdom?: string;
  clanTag?: string;
  capitolLevel?: number;
  heroId?: 'garvel' | 'julia';
  updatedAt?: string;
}

export interface PlayerProfile {
  id?: string;
  playerName?: string;
  kingdom?: string;
  clanTag?: string;
  heroId?: 'garvel' | 'julia';
  heroName?: string;
  heroLevel: number;
  /** Atributos copiados pelo jogador da tela do jogo; não são calculados pelo nível. */
  heroLeadership?: number;
  heroGeneralAttackPercent?: number;
  includeHero?: boolean;
  capitolLevel: number;
  dragonLevel: number;
  maxMarchCapacity: number;        // Liderança máxima para guardas e especialistas
  mercenaryCapacity: number;       // Autoridade máxima para mercenários
  specialCapacity: number;         // Dominância máxima para monstros
  selectedCaptainId: string;       // Capitão principal (retrocompatibilidade)
  selectedCaptainIds?: string[];   // Até 3 capitães selecionados simultaneamente
  captainLevels: Record<string, number>;
  captainStars?: Record<string, number>;
  /** Atributos copiados da tela do jogo, separados por capitão. */
  captainLeadership?: Record<string, number>;
  captainGeneralAttackPercent?: Record<string, number>;
  unlockedTroopIds: string[];
  ownedTroopCounts: Record<string, number>;
  activeMarches?: ActiveMarch[];
  attackHistory?: AttackHistoryEntry[];
  customTroopStats: Record<string, { attack: number; health: number }>;
  customTroops?: TroopUnit[];      // Tropas personalizadas criadas pelo jogador
  academyBonus: {
    guardsmenAttack: number;
    guardsmenHealth: number;
    specialistsAttack: number;
    specialistsHealth: number;
    monstersAttack: number;
    monstersHealth: number;
  };
}

export interface ActiveMarch {
  simulationSnapshot?: CombatSimulationSnapshot;
  id: string;
  targetId: string;
  targetName: string;
  targetLevel: number;
  createdAt: string;
  attackMode?: AttackMode;
  captainId?: string;
  captainName?: string;
  captainLevel?: number;
  dragonSent?: boolean;
  enemySquads?: EnemySquadUnit[];
  predictedOutcome?: CombatSimulationResult['outcome'];
  predictedSafetyLevel?: CombatSimulationResult['safetyLevel'];
  predictedCasualties?: SquadCasualty[];
  predictedPlayerDamage?: number;
  predictedEnemyHp?: number;
  predictedXp?: number;
  predictedVp?: number;
  squads: Array<{
    unitId: string;
    unitName: string;
    count: number;
  }>;
}

export interface AttackHistoryEntry extends ActiveMarch {
  status: 'in_progress' | 'completed';
  completedAt?: string;
  actualDeaths?: Array<{ unitId: string; unitName: string; count: number }>;
  returnedSquads?: Array<{ unitId: string; unitName: string; count: number }>;
}

export interface MarchSquadAllocation {
  unitId: string;
  unitName: string;
  tier: number;
  category: TroopCategory;
  troopClass: TroopClass;
  count: number;
  role: 'fodder' | 'primary_damage' | 'secondary_damage';
  totalSquadHealth: number;
  totalSquadAttack: number;
  expectedLosses: number;
}

export interface MarchRecommendation {
  targetId: string;
  targetName: string;
  targetLevel: number;
  captainName: string;
  squads: MarchSquadAllocation[];
  squadAllocationsMap: Record<string, number>; // Mapeia exatamente cada Troop ID para a quantidade sugerida
  totalMarchSize: number;
  /** Pontos de Liderança gastos pelas tropas regulares nesta marcha. */
  leadershipUsed?: number;
  maxCapacity: number;
  mercenarySize: number;
  mercenaryCapacity: number;
  capacityUtilizationPercent: number;
  exceedsCapacity: boolean;
  expectedCombatRounds: number;
  expectedVictoryProbability: number;
  projectedValorPoints: number;
  projectedChestPoints: number;
  projectedCaptainXP: number;
  estimatedTempleRevivalSilver: number;
  tacticalNotes: string[];
}

export interface CryptRecommendation {
  canOneShot: boolean;
  cryptLevel: number;
  requiredAttackPower: number;
  recommendedSquads: MarchSquadAllocation[];
  totalMarchSize: number;
  tarCost: number;
  projectedForgingMaterials: number;
  warningMessage?: string;
}
