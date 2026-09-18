export type TroopCategory = 'guardsman' | 'specialist' | 'monster' | 'mercenary';
export type TroopClass = 'melee' | 'ranged' | 'mounted' | 'flying' | 'siege';

export interface TroopAspects {
  bonusVsMeleePercent?: number;
  bonusVsRangedPercent?: number;
  bonusVsMountedPercent?: number;
  bonusVsFlyingPercent?: number;
  bonusVsSiegePercent?: number;
  bonusVsBeastsPercent?: number;
  bonusVsFortificationsPercent?: number;
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

export interface MonsterTarget {
  id: string;
  name: string;
  type: TargetType;
  level: number;
  totalHealth: number;
  baseAttack: number;
  squadCount: number;
  weaknessClasses: TroopClass[];
  customHealthOverride?: number;
  customAttackOverride?: number;
  estimatedValorPoints: number;
  estimatedChestPoints: number;
  estimatedCaptainXP: number;
  description?: string;
}

export interface PlayerProfile {
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
