export type TroopCategory = 'guardsman' | 'specialist' | 'monster' | 'mercenary';
export type TroopClass = 'melee' | 'ranged' | 'mounted' | 'flying' | 'siege';

export interface TroopAspects {
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
}

export type CaptainSpecialty = 'monsters' | 'crypts' | 'pvp' | 'economy' | 'speed';

export interface Captain {
  id: string;
  name: string;
  level: number;
  stars?: number;
  specialty: CaptainSpecialty;
  monsterAttackBonusPercent: number;
  cryptTarReductionPercent: number;
  marchSpeedBonusPercent: number;
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
  initialCount: number;
  lostCount: number;
  survivingCount: number;
}

export interface CombatSimulationResult {
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
  includeHero?: boolean;
  capitolLevel: number;
  dragonLevel: number;
  maxMarchCapacity: number;        // Limite de Exército: 3.125
  mercenaryCapacity: number;       // Limite de Mercenários: 1.540
  specialCapacity: number;         // Limite Especial: 770
  selectedCaptainId: string;       // Capitão principal (retrocompatibilidade)
  selectedCaptainIds?: string[];   // Até 3 capitães selecionados simultaneamente
  captainLevels: Record<string, number>;
  captainStars?: Record<string, number>;
  unlockedTroopIds: string[];
  ownedTroopCounts: Record<string, number>;
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
