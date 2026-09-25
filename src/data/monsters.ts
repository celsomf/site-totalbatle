import { MonsterTarget, TroopClass, TargetType, AttackMode, EnemySquadUnit, CustomMonsterVariant } from '../types';

export type { EnemySquadUnit, CustomMonsterVariant };

export interface MonsterUnitDefinition {
  id: string;
  name: string;
  tier: number;
  family: 'inferno' | 'cursed' | 'undead' | 'barbarian' | 'elemental' | 'epic' | 'elfos';
  subType: string;
  troopClass: TroopClass;
  unitAttack: number;
  unitHealth: number;
  leadership: number;
  initiative: number;
  aspects: {
    bonusVsMeleePercent?: number;
    bonusVsRangedPercent?: number;
    bonusVsMountedPercent?: number;
    bonusVsFlyingPercent?: number;
    bonusVsElementalsPercent?: number;
    description: string;
  };
}

// 1. Catálogo Completo de Monstros do Total Battle
export const MONSTER_UNITS_CATALOG: MonsterUnitDefinition[] = [
  // --- INFERNO / DEMÔNIOS ---
  {
    id: 'magogue',
    name: 'Magogue',
    tier: 1,
    family: 'inferno',
    subType: 'Demônio, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 50,
    unitHealth: 150,
    leadership: 1,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 30,
      description: 'Força contra unidades corpo a corpo: +30%',
    },
  },
  {
    id: 'demonio_chifres',
    name: 'Demônio com Chifres',
    tier: 2,
    family: 'inferno',
    subType: 'Demônio, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 720,
    unitHealth: 2160,
    leadership: 8,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 40,
      description: 'Força contra unidades montadas: +40%',
    },
  },
  {
    id: 'cavalgante_fogo',
    name: 'Cavalgante de Fogo',
    tier: 3,
    family: 'inferno',
    subType: 'Demônio, Unidade montada',
    troopClass: 'mounted',
    unitAttack: 4100,
    unitHealth: 12300,
    leadership: 25,
    initiative: 10,
    aspects: {
      bonusVsRangedPercent: 50,
      description: 'Força contra unidades de longo alcance: +50%',
    },
  },
  {
    id: 'pitonisa_fogo',
    name: 'Pitonisa de Fogo',
    tier: 4,
    family: 'inferno',
    subType: 'Demônio, Unidade voadora',
    troopClass: 'flying',
    unitAttack: 10200,
    unitHealth: 30600,
    leadership: 35,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 60,
      description: 'Força contra unidades corpo a corpo: +60%',
    },
  },
  {
    id: 'senhor_inferno',
    name: 'Senhor do Abismo',
    tier: 5,
    family: 'inferno',
    subType: 'Demônio Colossal, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 24000,
    unitHealth: 72000,
    leadership: 60,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 60,
      description: 'Força contra unidades montadas: +60%',
    },
  },

  // --- AMALDIÇOADOS (CURSED) ---
  {
    id: 'feiticeiro',
    name: 'Feiticeiro',
    tier: 1,
    family: 'cursed',
    subType: 'Amaldiçoado, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 150,
    unitHealth: 450,
    leadership: 3,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 25,
      description: 'Força contra unidades corpo a corpo: +25%',
    },
  },
  {
    id: 'cavalgante_jaguar',
    name: 'Cavalgante de Jaguar',
    tier: 2,
    family: 'cursed',
    subType: 'Amaldiçoado, Unidade montada',
    troopClass: 'mounted',
    unitAttack: 270,
    unitHealth: 810,
    leadership: 3,
    initiative: 10,
    aspects: {
      bonusVsRangedPercent: 30,
      description: 'Força contra unidades de longo alcance: +30%',
    },
  },
  {
    id: 'guerreiro_ossos',
    name: 'Guerreiro de Ossos',
    tier: 3,
    family: 'cursed',
    subType: 'Amaldiçoado, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 3800,
    unitHealth: 11400,
    leadership: 22,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 40,
      description: 'Força contra unidades montadas: +40%',
    },
  },
  {
    id: 'vampiro',
    name: 'Vampiro',
    tier: 4,
    family: 'cursed',
    subType: 'Fera, Amaldiçoado, Unidade voadora',
    troopClass: 'flying',
    unitAttack: 9900,
    unitHealth: 29700,
    leadership: 34,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 60,
      bonusVsElementalsPercent: 40,
      description: 'Força contra unidades corpo a corpo: +60% | Força contra elementais: +40%',
    },
  },
  {
    id: 'rei_amaldicoado',
    name: 'Rei Amaldiçoado',
    tier: 5,
    family: 'cursed',
    subType: 'Amaldiçoado Supremo, Unidade montada',
    troopClass: 'mounted',
    unitAttack: 23500,
    unitHealth: 70500,
    leadership: 55,
    initiative: 10,
    aspects: {
      bonusVsRangedPercent: 65,
      description: 'Força contra unidades de longo alcance: +65%',
    },
  },

  // --- MORTOS-VIVOS (UNDEAD) ---
  {
    id: 'esqueleto_guerreiro',
    name: 'Esqueleto Guerreiro',
    tier: 1,
    family: 'undead',
    subType: 'Morto-Vivo, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 120,
    unitHealth: 360,
    leadership: 2,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 20,
      description: 'Força contra unidades montadas: +20%',
    },
  },
  {
    id: 'banshee',
    name: 'Banshee',
    tier: 1,
    family: 'undead',
    subType: 'Morto-Vivo, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 100,
    unitHealth: 300,
    leadership: 2,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 45,
      description: 'Força contra unidades corpo a corpo: +45%',
    },
  },
  {
    id: 'esqueleto_arqueiro',
    name: 'Esqueleto Arqueiro',
    tier: 2,
    family: 'undead',
    subType: 'Morto-Vivo, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 650,
    unitHealth: 1950,
    leadership: 7,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 30,
      description: 'Força contra unidades corpo a corpo: +30%',
    },
  },
  {
    id: 'cavaleiro_morte',
    name: 'Cavaleiro da Morte',
    tier: 3,
    family: 'undead',
    subType: 'Morto-Vivo, Unidade montada',
    troopClass: 'mounted',
    unitAttack: 3900,
    unitHealth: 11700,
    leadership: 24,
    initiative: 10,
    aspects: {
      bonusVsRangedPercent: 45,
      description: 'Força contra unidades de longo alcance: +45%',
    },
  },
  {
    id: 'lich_ancestral',
    name: 'Lich Ancestral',
    tier: 4,
    family: 'undead',
    subType: 'Morto-Vivo, Feiticeiro Voador',
    troopClass: 'flying',
    unitAttack: 9800,
    unitHealth: 29400,
    leadership: 32,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 55,
      description: 'Dano sombrio em área: +55%',
    },
  },
  {
    id: 'dracolich',
    name: 'Dracolich Titânico',
    tier: 5,
    family: 'undead',
    subType: 'Morto-Vivo, Dragão Esqueleto',
    troopClass: 'flying',
    unitAttack: 25000,
    unitHealth: 75000,
    leadership: 65,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 65,
      description: 'Baforada espectral corrosiva: +65%',
    },
  },

  // --- BÁRBAROS (BARBARIAN) ---
  {
    id: 'salteador_machado',
    name: 'Salteador do Machado',
    tier: 1,
    family: 'barbarian',
    subType: 'Bárbaro, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 140,
    unitHealth: 420,
    leadership: 3,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 25,
      description: 'Força contra unidades montadas: +25%',
    },
  },
  {
    id: 'cacador_estepes',
    name: 'Caçador das Estepes',
    tier: 2,
    family: 'barbarian',
    subType: 'Bárbaro, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 700,
    unitHealth: 2100,
    leadership: 8,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 30,
      description: 'Força contra unidades corpo a corpo: +30%',
    },
  },
  {
    id: 'cavaleiro_lobo',
    name: 'Cavaleiro de Lobo',
    tier: 3,
    family: 'barbarian',
    subType: 'Bárbaro, Unidade montada',
    troopClass: 'mounted',
    unitAttack: 4000,
    unitHealth: 12000,
    leadership: 25,
    initiative: 10,
    aspects: {
      bonusVsRangedPercent: 50,
      description: 'Força contra unidades de longo alcance: +50%',
    },
  },
  {
    id: 'berserker_colossal',
    name: 'Berserker Colossal',
    tier: 4,
    family: 'barbarian',
    subType: 'Bárbaro Furioso, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 10500,
    unitHealth: 31500,
    leadership: 35,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 60,
      description: 'Fúria sangrenta: +60% vs montaria',
    },
  },
  {
    id: 'chefe_guerra_barbaro',
    name: 'Chefe de Guerra Bárbaro',
    tier: 5,
    family: 'barbarian',
    subType: 'Bárbaro Supremo, Unidade montada',
    troopClass: 'mounted',
    unitAttack: 24500,
    unitHealth: 73500,
    leadership: 60,
    initiative: 10,
    aspects: {
      bonusVsRangedPercent: 60,
      description: 'Impacto devastador: +60%',
    },
  },

  // --- ÉLFICOS & ELEMENTAIS (ELVES & ELEMENTALS) ---
  {
    id: 'patrulheiro_elfo',
    name: 'Patrulheiro Élfico',
    tier: 1,
    family: 'elemental',
    subType: 'Élfico, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 160,
    unitHealth: 480,
    leadership: 3,
    initiative: 11,
    aspects: {
      bonusVsMeleePercent: 30,
      description: 'Flechas precisas: +30% vs corpo a corpo',
    },
  },
  {
    id: 'guardiao_pedra',
    name: 'Guardião de Pedra',
    tier: 2,
    family: 'elemental',
    subType: 'Elemental, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 750,
    unitHealth: 2250,
    leadership: 8,
    initiative: 9,
    aspects: {
      bonusVsMountedPercent: 35,
      description: 'Pele rochosa: +35% vs montadas',
    },
  },
  {
    id: 'cavaleiro_grifo',
    name: 'Cavaleiro de Grifo',
    tier: 3,
    family: 'elemental',
    subType: 'Élfico / Fera, Unidade voadora',
    troopClass: 'flying',
    unitAttack: 4200,
    unitHealth: 12600,
    leadership: 26,
    initiative: 12,
    aspects: {
      bonusVsMeleePercent: 45,
      description: 'Mergulho aéreo: +45%',
    },
  },
  {
    id: 'elemental_fogo',
    name: 'Elemental de Fogo Primordial',
    tier: 4,
    family: 'elemental',
    subType: 'Elemental, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 10600,
    unitHealth: 31800,
    leadership: 36,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 60,
      description: 'Chamas consumidoras: +60%',
    },
  },
  {
    id: 'anciao_floresta',
    name: 'Ancião Guardião da Floresta',
    tier: 5,
    family: 'elemental',
    subType: 'Elemental Titânico, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 25000,
    unitHealth: 75000,
    leadership: 65,
    initiative: 9,
    aspects: {
      bonusVsMountedPercent: 65,
      description: 'Raízes esmagadoras: +65%',
    },
  },

  // --- CHEFES ÉPICOS ---
  {
    id: 'tinman_unit',
    name: 'Homem de Lata Ancestral (Tinman)',
    tier: 5,
    family: 'epic',
    subType: 'Colossal Mecânico Épico',
    troopClass: 'melee',
    unitAttack: 1100,
    unitHealth: 16000,
    leadership: 100,
    initiative: 10,
    aspects: {
      description: 'Ataque em área que prioriza o esquadrão com maior HP.',
    },
  },
  {
    id: 'fenrir_unit',
    name: 'Lobo Fenrir Destruidor',
    tier: 5,
    family: 'epic',
    subType: 'Fera Épica de Gelo',
    troopClass: 'mounted',
    unitAttack: 1250,
    unitHealth: 18000,
    leadership: 100,
    initiative: 10,
    aspects: {
      description: 'Fúria elemental que dobra o dano a cada 3 rounds.',
    },
  },
  {
    id: 'jormungandr_unit',
    name: 'Serpente do Mundo (Jörmungandr)',
    tier: 5,
    family: 'epic',
    subType: 'Serpente Titânica dos Mares',
    troopClass: 'flying',
    unitAttack: 1600,
    unitHealth: 24000,
    leadership: 120,
    initiative: 10,
    aspects: {
      description: 'Veneno corrosivo que causa dano contínuo em todas as tropas.',
    },
  },
  {
    id: 'arachne_unit',
    name: 'Aracne Tecedora das Sombras',
    tier: 5,
    family: 'epic',
    subType: 'Fera Aracnídea Épica',
    troopClass: 'ranged',
    unitAttack: 1400,
    unitHealth: 21000,
    leadership: 110,
    initiative: 11,
    aspects: {
      description: 'Teia imobilizadora que reduz a iniciativa das tropas inimigas.',
    },
  },
  {
    id: 'cerberus_unit',
    name: 'Cérbero Guardião do Submundo',
    tier: 5,
    family: 'epic',
    subType: 'Fera Demoníaca Épica',
    troopClass: 'melee',
    unitAttack: 1550,
    unitHealth: 23000,
    leadership: 115,
    initiative: 10,
    aspects: {
      description: 'Tríplice mordida que atinge 3 esquadrões simultaneamente.',
    },
  },
  {
    id: 'phoenix_unit',
    name: 'Fênix Solar Ancestral',
    tier: 5,
    family: 'epic',
    subType: 'Fera Solar Sagrada',
    troopClass: 'flying',
    unitAttack: 1700,
    unitHealth: 26000,
    leadership: 125,
    initiative: 12,
    aspects: {
      description: 'Explosão de cinzas flamejantes ao receber dano letal.',
    },
  },
  {
    id: 'ancient_terror_unit',
    name: 'Terror Ancestral / Juízo Final',
    tier: 5,
    family: 'epic',
    subType: 'Titã Supremo do Juízo Final',
    troopClass: 'melee',
    unitAttack: 2100,
    unitHealth: 32000,
    leadership: 150,
    initiative: 10,
    aspects: {
      description: 'Golpe cataclísmico que causa dano massivo em linha.',
    },
  },

  // --- ELFOS (FLORESTA / NATUREZA) ---
  {
    id: 'druida',
    name: 'Druida',
    tier: 2,
    family: 'elfos',
    subType: 'Elfos, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 900,
    unitHealth: 2700,
    leadership: 10,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 25,
      description: 'Força contra unidades corpo a corpo: +25%',
    },
  },
  {
    id: 'anao',
    name: 'Anão',
    tier: 1,
    family: 'elfos',
    subType: 'Elfos, Unidade corpo a corpo',
    troopClass: 'melee',
    unitAttack: 28,
    unitHealth: 84,
    leadership: 1,
    initiative: 10,
    aspects: {
      bonusVsMountedPercent: 10,
      description: 'Força contra unidades montadas: +10%',
    },
  },
  {
    id: 'arqueiro_elfico',
    name: 'Arqueiro Élfico',
    tier: 1,
    family: 'elfos',
    subType: 'Elfos, Unidade de longo alcance',
    troopClass: 'ranged',
    unitAttack: 100,
    unitHealth: 300,
    leadership: 2,
    initiative: 10,
    aspects: {
      bonusVsMeleePercent: 35,
      description: 'Força contra unidades corpo a corpo: +35%',
    },
  },
];

export function getMonsterUnit(id: string): MonsterUnitDefinition {
  const found = MONSTER_UNITS_CATALOG.find((u) => u.id === id);
  if (!found) {
    return MONSTER_UNITS_CATALOG[0];
  }
  return found;
}

export interface MonsterPresetTemplate {
  id: string;
  name: string;
  faction: 'inferno' | 'cursed' | 'undead' | 'barbarian' | 'elemental' | 'epic' | 'elfos';
  attackMode: AttackMode;
  targetType: TargetType;
  defaultLevel: number;
  availableLevels: number[];
  generateSquads: (level: number) => EnemySquadUnit[];
  calculateRewards: (level: number) => { xp: number; vp: number; tar?: number; chest?: number };
  marchCapacities: (level: number, attackMode: AttackMode) => { guards: number; mercenaries: number; monsters: number };
  description: string;
}

// 2. Templates de Monstros: 5 Famílias (Comum + Raro) + 7 Chefes Épicos
export const MONSTER_PRESET_TEMPLATES: MonsterPresetTemplate[] = [
  // ==========================================
  // ATAQUE COMUM (CAPITÃO) - 5 FAMÍLIAS
  // ==========================================

  // 1. Tropa do Inferno Comum
  {
    id: 'tropa_inferno_comum',
    name: '🔥 Tropa do Inferno Comum',
    faction: 'inferno',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 17,
    availableLevels: [5, 10, 12, 15, 17, 20, 22, 25, 30, 35, 40],
    description: 'Demônios de ataque comum liderados por Cavalgantes de Fogo e Demônios com Chifres.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 19647),
      vp: Math.round(lvl * 9823),
      tar: Math.round(lvl * 14764),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // 2. Tropa de Amaldiçoados Comum
  {
    id: 'tropa_amaldicoados_comum',
    name: '💀 Tropa de Amaldiçoados Comum',
    faction: 'cursed',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 16,
    availableLevels: [5, 10, 12, 15, 16, 20, 25, 30, 35, 40],
    description: 'Amaldiçoados comuns liderados por Guerreiros de Ossos e Feiticeiros.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 18500),
      vp: Math.round(lvl * 9200),
      tar: Math.round(lvl * 14000),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // 3. Tropa de Mortos-Vivos Comum
  {
    id: 'tropa_undead_comum',
    name: '🧟 Tropa de Mortos-Vivos Comum',
    faction: 'undead',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 15,
    availableLevels: [5, 10, 15, 18, 20, 25, 30, 35, 40],
    description: 'Hordas de esqueletos e cavaleiros da morte assombrando as florestas.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 18000),
      vp: Math.round(lvl * 9000),
      tar: Math.round(lvl * 13500),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // 3a. Tropa de Banshees (Mortos-Vivos Comum - Longo Alcance)
  {
    id: 'tropa_banshee_comum',
    name: '👻 Tropa de Banshees Comum (Longo Alcance)',
    faction: 'undead',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 6,
    availableLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25],
    description: 'Banshees espectrais de longo alcance (210 no Nv 6). Atacam diretamente a linha de atiradores e têm +45% de dano contra corpo a corpo.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 15000),
      vp: Math.round(lvl * 7500),
      tar: Math.round(lvl * 11000),
      chest: Math.round(lvl * 2),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // 4. Tropa de Bárbaros Comum
  {
    id: 'tropa_barbaros_comum',
    name: '🪓 Tropa de Bárbaros Comum',
    faction: 'barbarian',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 15,
    availableLevels: [5, 10, 15, 20, 25, 30, 35, 40],
    description: 'Bárbaros saqueadores das montanhas liderados por Caçadores e Salteadores.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 17800),
      vp: Math.round(lvl * 8900),
      tar: Math.round(lvl * 13000),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // 5. Tropa Élfica & Elemental Comum
  {
    id: 'tropa_elfos_comum',
    name: '🍃 Tropa Élfica & Elemental Comum',
    faction: 'elemental',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 15,
    availableLevels: [5, 10, 15, 20, 25, 30, 35, 40],
    description: 'Guardiões das florestas sagradas e elementais de pedra.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 18200),
      vp: Math.round(lvl * 9100),
      tar: Math.round(lvl * 13800),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // 6. Tropa de Elfos Comum (Dados Reais de Batalha: K:310 X:915 Y:233)
  {
    id: 'tropa_elfos_comum',
    name: '🌿 Tropa de Elfos Comum',
    faction: 'elfos',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 14,
    availableLevels: [5, 8, 10, 12, 14, 16, 18, 20, 25, 30],
    description: 'Elfos do mapa de batalha liderados por Druidas de longo alcance e infantaria de Anões guerreiros.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 22300),
      vp: Math.round(lvl * 10465),
      tar: Math.round(lvl * 15000),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({ guards: 2350, mercenaries: 1140, monsters: 570 }),
  },

  // 6b. Tropa de Arqueiros Élficos Comum (Longo Alcance)
  {
    id: 'tropa_arqueiros_elficos_comum',
    name: '🏹 Tropa de Arqueiros Élficos Comum (Longo Alcance)',
    faction: 'elfos',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 6,
    availableLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20],
    description: 'Atiradores élficos de longo alcance da floresta. Força 100, Saúde 300 e +35% contra corpo a corpo.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 16000),
      vp: Math.round(lvl * 8000),
      tar: Math.round(lvl * 12000),
      chest: Math.round(lvl * 2),
    }),
    marchCapacities: () => ({ guards: 2000, mercenaries: 1000, monsters: 500 }),
  },

  // ==========================================
  // ATAQUE RARO (HERÓI) - 5 FAMÍLIAS
  // ==========================================

  // 6. Tropa de Amaldiçoados Rara
  {
    id: 'tropa_amaldicoados_rara',
    name: '💀 Tropa de Amaldiçoados Rara',
    faction: 'cursed',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 21,
    availableLevels: [10, 15, 18, 20, 21, 25, 28, 30, 35, 40, 45],
    description: 'Tropa rara de alto poder liderada por Vampiros voadores, Cavalgantes de Jaguar e Feiticeiros.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 199000),
      vp: Math.round(lvl * 99500),
      tar: Math.round(lvl * 149500),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({ guards: 5250, mercenaries: 2520, monsters: 1260 }),
  },

  // 7. Tropa do Inferno Rara
  {
    id: 'tropa_inferno_rara',
    name: '🔥 Tropa do Inferno Rara',
    faction: 'inferno',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 22,
    availableLevels: [10, 15, 20, 22, 25, 28, 30, 35, 40, 45],
    description: 'Pitonisas de Fogo, Cavalgantes e hordas demoníacas raras de elite.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 205000),
      vp: Math.round(lvl * 102500),
      tar: Math.round(lvl * 153000),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({ guards: 5250, mercenaries: 2520, monsters: 1260 }),
  },

  // 8. Tropa de Mortos-Vivos Rara
  {
    id: 'tropa_undead_rara',
    name: '🧟 Tropa de Mortos-Vivos Rara',
    faction: 'undead',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 20,
    availableLevels: [10, 15, 20, 25, 30, 35, 40, 45],
    description: 'Liches Ancestrais e Cavaleiros da Morte em marcha de destruição.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 195000),
      vp: Math.round(lvl * 97500),
      tar: Math.round(lvl * 146000),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({ guards: 5250, mercenaries: 2520, monsters: 1260 }),
  },

  // 9. Tropa de Bárbaros Rara
  {
    id: 'tropa_barbaros_rara',
    name: '🪓 Tropa de Bárbaros Rara',
    faction: 'barbarian',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 20,
    availableLevels: [10, 15, 20, 25, 30, 35, 40, 45],
    description: 'Salteadores selvagens das montanhas montados em lobos ferozes e Berserkers.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 190000),
      vp: Math.round(lvl * 95000),
      tar: Math.round(lvl * 140000),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({ guards: 5250, mercenaries: 2520, monsters: 1260 }),
  },

  // 10. Tropa Élfica & Elemental Rara
  {
    id: 'tropa_elfos_rara',
    name: '🍃 Tropa Élfica & Elemental Rara',
    faction: 'elemental',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 22,
    availableLevels: [10, 15, 20, 22, 25, 30, 35, 40, 45],
    description: 'Elementais de Fogo Primordiais, Cavaleiros de Grifo e Patrulheiros.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 200000),
      vp: Math.round(lvl * 100000),
      tar: Math.round(lvl * 150000),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({ guards: 5250, mercenaries: 2520, monsters: 1260 }),
  },

  // ==========================================
  // MONSTROS ÉPICOS (CLÃ & TORNEIOS) - 7 CHEFES
  // ==========================================

  // 11. Homem de Lata Ancestral (Tinman)
  {
    id: 'tinman',
    name: '🤖 Homem de Lata Ancestral (Tinman)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 15,
    availableLevels: [5, 10, 15, 20, 25, 30, 35, 40],
    description: 'Monstro Épico de Clã. Prioriza o esquadrão com maior HP.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 650 + 15000),
      vp: Math.round(lvl * lvl * 320 + 8000),
      chest: Math.round(lvl * 12 + 40),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },

  // 12. Lobo Fenrir Destruidor
  {
    id: 'fenrir',
    name: '🐺 Lobo Fenrir Destruidor',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 20,
    availableLevels: [10, 15, 20, 25, 30, 35, 40],
    description: 'Fera colossal de gelo e fúria.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 700 + 18000),
      vp: Math.round(lvl * lvl * 350 + 9000),
      chest: Math.round(lvl * 15 + 50),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },

  // 13. Serpente do Mundo (Jörmungandr)
  {
    id: 'jormungandr',
    name: '🐍 Serpente do Mundo (Jörmungandr)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 25,
    availableLevels: [15, 20, 25, 30, 35, 40],
    description: 'Chefe titânico de torneio marítimo.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 800 + 25000),
      vp: Math.round(lvl * lvl * 400 + 12000),
      chest: Math.round(lvl * 20 + 60),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },

  // 14. Aracne Tecedora (Arachne)
  {
    id: 'arachne',
    name: '🕷️ Aracne Tecedora (Arachne)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 20,
    availableLevels: [10, 15, 20, 25, 30, 35, 40],
    description: 'Rainha das aranhas sombrias. Dispara teias paralisantes.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 720 + 19000),
      vp: Math.round(lvl * lvl * 360 + 9500),
      chest: Math.round(lvl * 16 + 55),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },

  // 15. Cérbero das Profundezas (Cerberus)
  {
    id: 'cerberus',
    name: '🐕 Cérbero das Profundezas (Cerberus)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 22,
    availableLevels: [10, 15, 20, 22, 25, 30, 35, 40],
    description: 'Guardião de 3 cabeças do inferno. Golpe triplo em linha.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 750 + 20000),
      vp: Math.round(lvl * lvl * 370 + 10000),
      chest: Math.round(lvl * 17 + 55),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },

  // 16. Fênix Solar Ardente (Phoenix)
  {
    id: 'phoenix',
    name: '🔥 Fênix Solar Ardente (Phoenix)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 25,
    availableLevels: [15, 20, 25, 30, 35, 40],
    description: 'Pássaro mítico solar de destruição em área.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 820 + 26000),
      vp: Math.round(lvl * lvl * 410 + 13000),
      chest: Math.round(lvl * 20 + 65),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },

  // 17. Terror Ancestral / Juízo Final (Ancient / Doomsday)
  {
    id: 'ancient_terror',
    name: '⏳ Terror Ancestral (Juízo Final)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 30,
    availableLevels: [20, 25, 30, 35, 40, 45],
    description: 'Chefe supremo de clã. Dano cataclísmico em todas as linhas.',
    generateSquads: (): EnemySquadUnit[] => [],
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 900 + 30000),
      vp: Math.round(lvl * lvl * 450 + 15000),
      chest: Math.round(lvl * 25 + 80),
    }),
    marchCapacities: () => ({ guards: 3125, mercenaries: 1540, monsters: 770 }),
  },
];


const CUSTOM_MONSTER_TARGETS_STORAGE_KEY = 'tba_custom_monster_targets_v1';

const memoryStorageFallback: Record<string, string> = {};

function getSafeStorage(): { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void } {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: (k: string) => (k in memoryStorageFallback ? memoryStorageFallback[k] : null),
    setItem: (k: string, v: string) => {
      memoryStorageFallback[k] = v;
    },
    removeItem: (k: string) => {
      delete memoryStorageFallback[k];
    },
  };
}

export interface CustomMonsterLevelEntry {
  activeVariantId?: string;
  variants: CustomMonsterVariant[];
}

export function getCustomTargetsMap(): Record<string, any> {
  try {
    const storage = getSafeStorage();
    const raw = storage.getItem(CUSTOM_MONSTER_TARGETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Erro ao ler monstros customizados do localStorage:', e);
    return {};
  }
}

export function normalizeLevelEntry(rawEntry: any): CustomMonsterLevelEntry | null {
  if (!rawEntry) return null;
  if (Array.isArray(rawEntry)) {
    if (rawEntry.length === 0) return null;
    return {
      activeVariantId: 'variant_1',
      variants: [
        {
          id: 'variant_1',
          name: 'Equipe 1',
          squads: rawEntry,
        },
      ],
    };
  }
  if (rawEntry.variants && Array.isArray(rawEntry.variants) && rawEntry.variants.length > 0) {
    const activeVariantId = rawEntry.activeVariantId || rawEntry.variants[0].id;
    return {
      activeVariantId,
      variants: rawEntry.variants,
    };
  }
  return null;
}

export function getSavedCustomVariants(templateId: string, level: number): CustomMonsterVariant[] {
  const map = getCustomTargetsMap();
  const key = `${templateId}_lvl_${level}`;
  const entry = normalizeLevelEntry(map[key]);
  return entry ? entry.variants : [];
}

export function getActiveCustomVariant(templateId: string, level: number): CustomMonsterVariant | null {
  const map = getCustomTargetsMap();
  const key = `${templateId}_lvl_${level}`;
  const entry = normalizeLevelEntry(map[key]);
  if (!entry || entry.variants.length === 0) return null;
  const found = entry.variants.find((v) => v.id === entry.activeVariantId);
  return found || entry.variants[0];
}

export function getSavedCustomSquads(
  templateId: string,
  level: number,
  variantId?: string
): EnemySquadUnit[] | null {
  const variants = getSavedCustomVariants(templateId, level);
  if (variants.length === 0) return null;
  if (variantId) {
    const found = variants.find((v) => v.id === variantId);
    return found ? found.squads : null;
  }
  const active = getActiveCustomVariant(templateId, level);
  return active ? active.squads : null;
}

export function hasSavedCustomSquads(templateId: string, level: number): boolean {
  return getSavedCustomVariants(templateId, level).length > 0;
}

export function saveCustomMonsterVariant(
  templateId: string,
  level: number,
  squads: EnemySquadUnit[],
  variantName?: string,
  variantIdToUpdate?: string
): CustomMonsterVariant {
  try {
    const map = getCustomTargetsMap();
    const key = `${templateId}_lvl_${level}`;
    const existing = normalizeLevelEntry(map[key]);

    const variants: CustomMonsterVariant[] = existing ? [...existing.variants] : [];
    let updatedVariant: CustomMonsterVariant;

    if (variantIdToUpdate) {
      const idx = variants.findIndex((v) => v.id === variantIdToUpdate);
      if (idx >= 0) {
        updatedVariant = {
          ...variants[idx],
          name: variantName || variants[idx].name,
          squads,
        };
        variants[idx] = updatedVariant;
      } else {
        updatedVariant = {
          id: variantIdToUpdate,
          name: variantName || `Equipe ${variants.length + 1}`,
          squads,
          createdAt: Date.now(),
        };
        variants.push(updatedVariant);
      }
    } else {
      const newId = `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const defaultName = `Equipe ${variants.length + 1}`;
      updatedVariant = {
        id: newId,
        name: variantName || defaultName,
        squads,
        createdAt: Date.now(),
      };
      variants.push(updatedVariant);
    }

    const newEntry: CustomMonsterLevelEntry = {
      activeVariantId: updatedVariant.id,
      variants,
    };

    map[key] = newEntry;
    const storage = getSafeStorage();
    storage.setItem(CUSTOM_MONSTER_TARGETS_STORAGE_KEY, JSON.stringify(map));
    return updatedVariant;
  } catch (e) {
    console.error('Erro ao salvar variante de monstro no localStorage:', e);
    return {
      id: 'fallback',
      name: variantName || 'Equipe',
      squads,
    };
  }
}

export function setActiveCustomVariant(templateId: string, level: number, variantId: string): void {
  try {
    const map = getCustomTargetsMap();
    const key = `${templateId}_lvl_${level}`;
    const existing = normalizeLevelEntry(map[key]);
    if (!existing) return;

    if (existing.variants.some((v) => v.id === variantId)) {
      existing.activeVariantId = variantId;
      map[key] = existing;
      const storage = getSafeStorage();
      storage.setItem(CUSTOM_MONSTER_TARGETS_STORAGE_KEY, JSON.stringify(map));
    }
  } catch (e) {
    console.error('Erro ao alternar variante ativa:', e);
  }
}

export function saveCustomMonsterSquads(
  templateId: string,
  level: number,
  squads: EnemySquadUnit[]
): void {
  const active = getActiveCustomVariant(templateId, level);
  saveCustomMonsterVariant(templateId, level, squads, active?.name, active?.id);
}

export function removeSavedCustomMonsterVariant(
  templateId: string,
  level: number,
  variantId?: string
): void {
  try {
    const map = getCustomTargetsMap();
    const key = `${templateId}_lvl_${level}`;
    if (!variantId) {
      delete map[key];
    } else {
      const existing = normalizeLevelEntry(map[key]);
      if (existing) {
        existing.variants = existing.variants.filter((v) => v.id !== variantId);
        if (existing.variants.length === 0) {
          delete map[key];
        } else {
          if (existing.activeVariantId === variantId) {
            existing.activeVariantId = existing.variants[0].id;
          }
          map[key] = existing;
        }
      }
    }
    const storage = getSafeStorage();
    storage.setItem(CUSTOM_MONSTER_TARGETS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Erro ao remover variante de monstro do localStorage:', e);
  }
}

export function removeSavedCustomMonsterSquads(templateId: string, level: number): void {
  removeSavedCustomMonsterVariant(templateId, level);
}

export function buildMonsterTargetFromTemplate(
  template: MonsterPresetTemplate,
  level: number,
  ignoreSaved: boolean = false,
  variantId?: string
): MonsterTarget {
  const validLevel = Math.max(1, Math.min(45, level));
  const variants = !ignoreSaved ? getSavedCustomVariants(template.id, validLevel) : [];
  const activeVariant =
    variants.length > 0
      ? variantId
        ? variants.find((v) => v.id === variantId) || variants[0]
        : getActiveCustomVariant(template.id, validLevel) || variants[0]
      : null;

  const isCustom = Boolean(activeVariant && activeVariant.squads.length > 0);
  const squads = isCustom ? activeVariant!.squads : (template.generateSquads ? template.generateSquads(validLevel) : []);
  const rewards = template.calculateRewards(validLevel);
  const caps = template.marchCapacities(validLevel, template.attackMode);

  const totalHealth = squads.reduce((sum, s) => sum + s.unitHealth * s.count, 0);
  const baseAttack = squads.reduce((sum, s) => sum + s.unitAttack * s.count, 0);

  const classesPresent = squads.map((s) => s.troopClass);
  const weaknessClasses: TroopClass[] = [];
  if (classesPresent.includes('ranged')) weaknessClasses.push('mounted');
  if (classesPresent.includes('mounted')) weaknessClasses.push('melee');
  if (classesPresent.includes('flying')) weaknessClasses.push('ranged');
  if (classesPresent.includes('melee')) weaknessClasses.push('ranged');

  const uniqueWeaknesses = Array.from(new Set(weaknessClasses));

  return {
    id: `${template.id}_lvl_${validLevel}`,
    name: `${template.name} (Nível ${validLevel})`,
    type: template.targetType,
    attackMode: template.attackMode,
    faction: template.faction,
    level: validLevel,
    totalHealth,
    baseAttack,
    squadCount: squads.length,
    weaknessClasses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : (squads.length > 0 ? ['ranged'] : []),
    enemySquads: squads,
    xpReward: rewards.xp,
    valorReward: rewards.vp,
    tarReward: rewards.tar,
    marchCapacities: caps,
    estimatedValorPoints: rewards.vp,
    estimatedCaptainXP: rewards.xp,
    estimatedChestPoints: rewards.chest || 10,
    description: template.description,
    isCustomConfig: isCustom,
    activeVariantId: activeVariant?.id,
    activeVariantName: activeVariant?.name,
  };
}

export const DEFAULT_MONSTERS: MonsterTarget[] = MONSTER_PRESET_TEMPLATES.map((tpl) =>
  buildMonsterTargetFromTemplate(tpl, tpl.defaultLevel)
);

export const MONSTER_ARCHETYPES = MONSTER_PRESET_TEMPLATES.map((tpl) => ({
  id: tpl.id,
  name: tpl.name,
  category: tpl.faction,
  type: tpl.targetType,
  weaknessClasses: ['ranged'] as TroopClass[],
  baseHealthFactor: 150,
  baseAttackFactor: 50,
  squadCountBase: 2,
  unitHealth: 150,
  unitAttack: 50,
  description: tpl.description,
  specialTrait: tpl.attackMode === 'rare' ? 'Ataque Raro (Herói)' : 'Ataque Comum (Capitão)',
  defaultLevel: tpl.defaultLevel,
  defaultUnitCount: 1,
}));

export function createMonsterInstance(archetype: any, level: number): MonsterTarget {
  const tpl = MONSTER_PRESET_TEMPLATES.find((t) => t.id === archetype.id) || MONSTER_PRESET_TEMPLATES[0];
  return buildMonsterTargetFromTemplate(tpl, level);
}

export function updateMonsterSquads(
  monster: MonsterTarget,
  newSquads: EnemySquadUnit[]
): MonsterTarget {
  const totalHealth = newSquads.reduce((sum, s) => sum + s.unitHealth * s.count, 0);
  const baseAttack = newSquads.reduce((sum, s) => sum + s.unitAttack * s.count, 0);

  const classesPresent = newSquads.map((s) => s.troopClass);
  const weaknessClasses: TroopClass[] = [];
  if (classesPresent.includes('ranged')) weaknessClasses.push('mounted');
  if (classesPresent.includes('mounted')) weaknessClasses.push('melee');
  if (classesPresent.includes('flying')) weaknessClasses.push('ranged');
  if (classesPresent.includes('melee')) weaknessClasses.push('ranged');

  const uniqueWeaknesses = Array.from(new Set(weaknessClasses));

  return {
    ...monster,
    totalHealth,
    baseAttack,
    squadCount: newSquads.length,
    weaknessClasses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['ranged'],
    enemySquads: newSquads,
  };
}
