import type { EnemySquadUnit, TroopUnit } from './index';
import type { MonsterUnitDefinition } from '../data/monsters';

export interface CatalogTargetLevel {
  id: string;
  level: number;
  xpReward: number;
  valorReward: number;
  tarReward?: number;
  chestReward?: number;
  marchCapacities: { guards: number; mercenaries: number; monsters: number };
  squads: EnemySquadUnit[];
}

export interface CatalogTargetTemplate {
  id: string;
  name: string;
  faction: string;
  watchtowerFamilyId: string;
  watchtowerFamilyName: string;
  watchtowerAvatarUnitId: string;
  attackMode: 'common' | 'rare' | 'epic';
  targetType: 'common_monster' | 'epic_monster';
  defaultLevel: number;
  availableLevels: number[];
  description: string;
  levels: CatalogTargetLevel[];
}

export interface GameCatalogData {
  troops: TroopUnit[];
  monsters: MonsterUnitDefinition[];
  templates: CatalogTargetTemplate[];
}
