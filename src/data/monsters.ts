import { MonsterTarget, TroopClass, TargetType, AttackMode, EnemySquadUnit } from '../types';

export interface MonsterUnitDefinition {
  id: string;
  name: string;
  tier: number;
  family: 'inferno' | 'cursed' | 'undead' | 'barbarian' | 'elemental' | 'epic';
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

// 1. Unidades Oficiais de Monstros do Jogo (Catalogadas dos prints e do banco do jogo)
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
      description: 'Dano sombrio em área',
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

  // --- ÉPICOS ---
  {
    id: 'tinman_unit',
    name: 'Homem de Lata Ancestral',
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
  faction: 'inferno' | 'cursed' | 'undead' | 'barbarian' | 'epic';
  attackMode: AttackMode;
  targetType: TargetType;
  defaultLevel: number;
  availableLevels: number[];
  generateSquads: (level: number) => EnemySquadUnit[];
  calculateRewards: (level: number) => { xp: number; vp: number; tar?: number; chest?: number };
  marchCapacities: (level: number, attackMode: AttackMode) => { guards: number; mercenaries: number; monsters: number };
  description: string;
}

export const MONSTER_PRESET_TEMPLATES: MonsterPresetTemplate[] = [
  // 1. TROPA DO INFERNO COMUM (Ataque Comum - Capitão)
  {
    id: 'tropa_inferno_comum',
    name: 'Tropa do Inferno Comum',
    faction: 'inferno',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 17,
    availableLevels: [5, 10, 12, 15, 17, 20, 22, 25, 30],
    description: 'Tropa de monstros demoníacos liderados por Cavalgantes de Fogo e Demônios com Chifres.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const cavalgante = getMonsterUnit('cavalgante_fogo');
      const demonio = getMonsterUnit('demonio_chifres');

      if (lvl <= 10) {
        const magogue = getMonsterUnit('magogue');
        return [
          {
            id: magogue.id,
            name: magogue.name,
            tier: magogue.tier,
            troopClass: magogue.troopClass,
            family: magogue.family,
            subType: magogue.subType,
            unitAttack: magogue.unitAttack,
            unitHealth: magogue.unitHealth,
            leadership: magogue.leadership,
            initiative: magogue.initiative,
            count: Math.round(230 * lvl),
            aspects: magogue.aspects,
          },
        ];
      }

      const scale = lvl / 17;
      const countCav = Math.max(10, Math.round(260 * scale));
      const countDem = Math.max(20, Math.round(640 * scale));

      return [
        {
          id: cavalgante.id,
          name: cavalgante.name,
          tier: cavalgante.tier,
          troopClass: cavalgante.troopClass,
          family: cavalgante.family,
          subType: cavalgante.subType,
          unitAttack: cavalgante.unitAttack,
          unitHealth: cavalgante.unitHealth,
          leadership: cavalgante.leadership,
          initiative: cavalgante.initiative,
          count: countCav,
          aspects: cavalgante.aspects,
        },
        {
          id: demonio.id,
          name: demonio.name,
          tier: demonio.tier,
          troopClass: demonio.troopClass,
          family: demonio.family,
          subType: demonio.subType,
          unitAttack: demonio.unitAttack,
          unitHealth: demonio.unitHealth,
          leadership: demonio.leadership,
          initiative: demonio.initiative,
          count: countDem,
          aspects: demonio.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 19647),
      vp: Math.round(lvl * 9823),
      tar: Math.round(lvl * 14764),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({
      guards: 2000,
      mercenaries: 1000,
      monsters: 500,
    }),
  },

  // 2. TROPA DE AMALDIÇOADOS RARA (Ataque Raro - Herói)
  {
    id: 'tropa_amaldicoados_rara',
    name: 'Tropa de Amaldiçoados Rara',
    faction: 'cursed',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 21,
    availableLevels: [10, 15, 18, 20, 21, 25, 28, 30, 35],
    description: 'Tropa rara de alto poder liderada por Vampiros voadores, Cavalgantes de Jaguar e Feiticeiros.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const vampiro = getMonsterUnit('vampiro');
      const jaguar = getMonsterUnit('cavalgante_jaguar');
      const feiticeiro = getMonsterUnit('feiticeiro');

      const scale = lvl / 21;
      const countVamp = Math.max(10, Math.round(630 * scale));
      const countJag = Math.max(500, Math.round(17000 * scale));
      const countFeit = Math.max(1000, Math.round(31000 * scale));

      return [
        {
          id: vampiro.id,
          name: vampiro.name,
          tier: vampiro.tier,
          troopClass: vampiro.troopClass,
          family: vampiro.family,
          subType: vampiro.subType,
          unitAttack: vampiro.unitAttack,
          unitHealth: vampiro.unitHealth,
          leadership: vampiro.leadership,
          initiative: vampiro.initiative,
          count: countVamp,
          aspects: vampiro.aspects,
        },
        {
          id: jaguar.id,
          name: jaguar.name,
          tier: jaguar.tier,
          troopClass: jaguar.troopClass,
          family: jaguar.family,
          subType: jaguar.subType,
          unitAttack: jaguar.unitAttack,
          unitHealth: jaguar.unitHealth,
          leadership: jaguar.leadership,
          initiative: jaguar.initiative,
          count: countJag,
          aspects: jaguar.aspects,
        },
        {
          id: feiticeiro.id,
          name: feiticeiro.name,
          tier: feiticeiro.tier,
          troopClass: feiticeiro.troopClass,
          family: feiticeiro.family,
          subType: feiticeiro.subType,
          unitAttack: feiticeiro.unitAttack,
          unitHealth: feiticeiro.unitHealth,
          leadership: feiticeiro.leadership,
          initiative: feiticeiro.initiative,
          count: countFeit,
          aspects: feiticeiro.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 199000),
      vp: Math.round(lvl * 99500),
      tar: Math.round(lvl * 149500),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({
      guards: 5250,
      mercenaries: 2520,
      monsters: 1260,
    }),
  },

  // 3. TROPA DE MORTOS-VIVOS COMUM
  {
    id: 'tropa_undead_comum',
    name: 'Tropa de Mortos-Vivos Comum',
    faction: 'undead',
    attackMode: 'common',
    targetType: 'common_monster',
    defaultLevel: 15,
    availableLevels: [5, 10, 15, 18, 20, 25],
    description: 'Hordas de esqueletos e cavaleiros da morte assombrando as florestas.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const cavaleiro = getMonsterUnit('cavaleiro_morte');
      const esqueleto = getMonsterUnit('esqueleto_arqueiro');
      const scale = lvl / 15;
      return [
        {
          id: cavaleiro.id,
          name: cavaleiro.name,
          tier: cavaleiro.tier,
          troopClass: cavaleiro.troopClass,
          family: cavaleiro.family,
          subType: cavaleiro.subType,
          unitAttack: cavaleiro.unitAttack,
          unitHealth: cavaleiro.unitHealth,
          leadership: cavaleiro.leadership,
          initiative: cavaleiro.initiative,
          count: Math.round(180 * scale),
          aspects: cavaleiro.aspects,
        },
        {
          id: esqueleto.id,
          name: esqueleto.name,
          tier: esqueleto.tier,
          troopClass: esqueleto.troopClass,
          family: esqueleto.family,
          subType: esqueleto.subType,
          unitAttack: esqueleto.unitAttack,
          unitHealth: esqueleto.unitHealth,
          leadership: esqueleto.leadership,
          initiative: esqueleto.initiative,
          count: Math.round(550 * scale),
          aspects: esqueleto.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 18000),
      vp: Math.round(lvl * 9000),
      tar: Math.round(lvl * 13500),
      chest: Math.round(lvl * 2.5),
    }),
    marchCapacities: () => ({
      guards: 2000,
      mercenaries: 1000,
      monsters: 500,
    }),
  },

  // 4. TROPA DE BÁRBAROS RARA
  {
    id: 'tropa_barbaros_rara',
    name: 'Tropa de Bárbaros Rara',
    faction: 'barbarian',
    attackMode: 'rare',
    targetType: 'common_monster',
    defaultLevel: 20,
    availableLevels: [10, 15, 20, 25, 30],
    description: 'Salteadores selvagens das montanhas montados em lobos ferozes.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const lobo = getMonsterUnit('cavaleiro_lobo');
      const cacador = getMonsterUnit('cacador_estepes');
      const machado = getMonsterUnit('salteador_machado');
      const scale = lvl / 20;
      return [
        {
          id: lobo.id,
          name: lobo.name,
          tier: lobo.tier,
          troopClass: lobo.troopClass,
          family: lobo.family,
          subType: lobo.subType,
          unitAttack: lobo.unitAttack,
          unitHealth: lobo.unitHealth,
          leadership: lobo.leadership,
          initiative: lobo.initiative,
          count: Math.round(450 * scale),
          aspects: lobo.aspects,
        },
        {
          id: cacador.id,
          name: cacador.name,
          tier: cacador.tier,
          troopClass: cacador.troopClass,
          family: cacador.family,
          subType: cacador.subType,
          unitAttack: cacador.unitAttack,
          unitHealth: cacador.unitHealth,
          leadership: cacador.leadership,
          initiative: cacador.initiative,
          count: Math.round(12000 * scale),
          aspects: cacador.aspects,
        },
        {
          id: machado.id,
          name: machado.name,
          tier: machado.tier,
          troopClass: machado.troopClass,
          family: machado.family,
          subType: machado.subType,
          unitAttack: machado.unitAttack,
          unitHealth: machado.unitHealth,
          leadership: machado.leadership,
          initiative: machado.initiative,
          count: Math.round(25000 * scale),
          aspects: machado.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * 190000),
      vp: Math.round(lvl * 95000),
      tar: Math.round(lvl * 140000),
      chest: Math.round(lvl * 5),
    }),
    marchCapacities: () => ({
      guards: 5250,
      mercenaries: 2520,
      monsters: 1260,
    }),
  },

  // 5. MONSTROS ÉPICOS (CLÃ & TORNEIOS)
  {
    id: 'tinman',
    name: 'Homem de Lata Ancestral (Tinman)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 15,
    availableLevels: [5, 10, 15, 20, 25, 30, 35, 40],
    description: 'Monstro Épico de Clã. Prioriza o esquadrão com maior HP.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const u = getMonsterUnit('tinman_unit');
      return [
        {
          id: u.id,
          name: u.name,
          tier: 5,
          troopClass: u.troopClass,
          family: u.family,
          subType: u.subType,
          unitAttack: Math.round(u.unitAttack * Math.pow(lvl, 1.45)),
          unitHealth: Math.round(u.unitHealth * Math.pow(lvl, 1.65)),
          leadership: 100,
          initiative: 10,
          count: 1,
          aspects: u.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 650 + 15000),
      vp: Math.round(lvl * lvl * 320 + 8000),
      chest: Math.round(lvl * 12 + 40),
    }),
    marchCapacities: () => ({
      guards: 3125,
      mercenaries: 1540,
      monsters: 770,
    }),
  },
  {
    id: 'fenrir',
    name: 'Lobo Fenrir Destruidor',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 20,
    availableLevels: [10, 15, 20, 25, 30, 35],
    description: 'Fera colossal de gelo e fúria.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const u = getMonsterUnit('fenrir_unit');
      return [
        {
          id: u.id,
          name: u.name,
          tier: 5,
          troopClass: u.troopClass,
          family: u.family,
          subType: u.subType,
          unitAttack: Math.round(u.unitAttack * Math.pow(lvl, 1.45)),
          unitHealth: Math.round(u.unitHealth * Math.pow(lvl, 1.65)),
          leadership: 100,
          initiative: 10,
          count: 1,
          aspects: u.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 700 + 18000),
      vp: Math.round(lvl * lvl * 350 + 9000),
      chest: Math.round(lvl * 15 + 50),
    }),
    marchCapacities: () => ({
      guards: 3125,
      mercenaries: 1540,
      monsters: 770,
    }),
  },
  {
    id: 'jormungandr',
    name: 'Serpente do Mundo (Jörmungandr)',
    faction: 'epic',
    attackMode: 'epic',
    targetType: 'epic_monster',
    defaultLevel: 25,
    availableLevels: [15, 20, 25, 30, 35, 40],
    description: 'Chefe titânico de torneio.',
    generateSquads: (lvl: number): EnemySquadUnit[] => {
      const u = getMonsterUnit('jormungandr_unit');
      return [
        {
          id: u.id,
          name: u.name,
          tier: 5,
          troopClass: u.troopClass,
          family: u.family,
          subType: u.subType,
          unitAttack: Math.round(u.unitAttack * Math.pow(lvl, 1.45)),
          unitHealth: Math.round(u.unitHealth * Math.pow(lvl, 1.65)),
          leadership: 120,
          initiative: 10,
          count: 1,
          aspects: u.aspects,
        },
      ];
    },
    calculateRewards: (lvl: number) => ({
      xp: Math.round(lvl * lvl * 800 + 25000),
      vp: Math.round(lvl * lvl * 400 + 12000),
      chest: Math.round(lvl * 20 + 60),
    }),
    marchCapacities: () => ({
      guards: 3125,
      mercenaries: 1540,
      monsters: 770,
    }),
  },
];

export function buildMonsterTargetFromTemplate(
  template: MonsterPresetTemplate,
  level: number
): MonsterTarget {
  const validLevel = Math.max(1, Math.min(45, level));
  const squads = template.generateSquads(validLevel);
  const rewards = template.calculateRewards(validLevel);
  const caps = template.marchCapacities(validLevel, template.attackMode);

  const totalHealth = squads.reduce((sum, s) => sum + (s.unitHealth * s.count), 0);
  const baseAttack = squads.reduce((sum, s) => sum + (s.unitAttack * s.count), 0);

  const classesPresent = squads.map((s) => s.troopClass);
  const weaknessClasses: TroopClass[] = [];
  if (classesPresent.includes('ranged')) weaknessClasses.push('melee', 'mounted');
  if (classesPresent.includes('mounted')) weaknessClasses.push('ranged', 'melee');
  if (classesPresent.includes('flying')) weaknessClasses.push('ranged');
  if (classesPresent.includes('melee')) weaknessClasses.push('ranged');

  const uniqueWeaknesses = Array.from(new Set(weaknessClasses));

  const coords = template.id === 'tropa_amaldicoados_rara'
    ? '(K:310 X:917 Y:253)'
    : template.id === 'tropa_inferno_comum'
    ? '(K:310 X:924 Y:264)'
    : '(K:310 X:922 Y:258)';

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
    weaknessClasses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['ranged'],
    enemySquads: squads,
    coordinates: coords,
    xpReward: rewards.xp,
    valorReward: rewards.vp,
    tarReward: rewards.tar,
    marchCapacities: caps,
    estimatedValorPoints: rewards.vp,
    estimatedCaptainXP: rewards.xp,
    estimatedChestPoints: rewards.chest || 10,
    description: template.description,
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
  const totalHealth = newSquads.reduce((sum, s) => sum + (s.unitHealth * s.count), 0);
  const baseAttack = newSquads.reduce((sum, s) => sum + (s.unitAttack * s.count), 0);

  const classesPresent = newSquads.map((s) => s.troopClass);
  const weaknessClasses: TroopClass[] = [];
  if (classesPresent.includes('ranged')) weaknessClasses.push('melee', 'mounted');
  if (classesPresent.includes('mounted')) weaknessClasses.push('ranged', 'melee');
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

