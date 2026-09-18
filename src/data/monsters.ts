import { MonsterTarget, TroopClass, TargetType } from '../types';

export interface MonsterArchetype {
  id: string;
  name: string;
  category: 'inferno' | 'undead' | 'barbarian' | 'elf' | 'cursed' | 'epic';
  type: TargetType;
  weaknessClasses: TroopClass[];
  baseHealthFactor: number;
  baseAttackFactor: number;
  squadCountBase: number;
  unitHealth: number;
  unitAttack: number;
  description: string;
  specialTrait: string;
  defaultLevel: number;
  defaultUnitCount: number;
}

export const MONSTER_ARCHETYPES: MonsterArchetype[] = [
  // 1. MAGOGUE / TROPA DO INFERNO (DEMÔNIO) - O monstro exato do print do jogador!
  {
    id: 'magogue_inferno',
    name: 'Magogue (Tropa do Inferno)',
    category: 'inferno',
    type: 'common_monster',
    weaknessClasses: ['ranged', 'mounted'],
    baseHealthFactor: 150,
    baseAttackFactor: 50,
    unitHealth: 150,
    unitAttack: 50,
    squadCountBase: 2,
    description: 'Demônio, Unidade de longo alcance. Liderança: 1, Iniciativa: 10.',
    specialTrait: 'Força contra unidades corpo a corpo: +30% (Use Arqueiros/Longo Alcance!)',
    defaultLevel: 10,
    defaultUnitCount: 2300, // 2.300 Magogues exatamente como na imagem do usuário!
  },

  // 2. MORTOS-VIVOS (UNDEAD)
  {
    id: 'undead_legion',
    name: 'Legião dos Mortos-Vivos (Esqueletos)',
    category: 'undead',
    type: 'common_monster',
    weaknessClasses: ['mounted', 'melee'],
    baseHealthFactor: 160,
    baseAttackFactor: 45,
    unitHealth: 160,
    unitAttack: 45,
    squadCountBase: 2,
    description: 'Horda de esqueletos e zumbis. Vulneráveis a investidas de cavalaria e dano de impacto.',
    specialTrait: 'Força contra infantaria leve: +20%',
    defaultLevel: 10,
    defaultUnitCount: 2100,
  },

  // 3. BÁRBAROS & SALTEADORES
  {
    id: 'barbarian_horde',
    name: 'Horda de Bárbaros & Salteadores',
    category: 'barbarian',
    type: 'common_monster',
    weaknessClasses: ['ranged'],
    baseHealthFactor: 180,
    baseAttackFactor: 60,
    unitHealth: 180,
    unitAttack: 60,
    squadCountBase: 2,
    description: 'Guerreiros nômades selvagens com alto ataque corpo-a-corpo.',
    specialTrait: 'Vulneráveis a chuva de flechas à distância.',
    defaultLevel: 10,
    defaultUnitCount: 1800,
  },

  // 4. ELFOS CORROMPIDOS
  {
    id: 'corrupted_elves',
    name: 'Elfos Renegados & Feiticeiros',
    category: 'elf',
    type: 'common_monster',
    weaknessClasses: ['melee'],
    baseHealthFactor: 140,
    baseAttackFactor: 65,
    unitHealth: 140,
    unitAttack: 65,
    squadCountBase: 2,
    description: 'Arqueiros e magos da floresta. Fracos contra investidas de infantaria pesada.',
    specialTrait: 'Ataque à distância rápido.',
    defaultLevel: 10,
    defaultUnitCount: 1900,
  },

  // 5. AMALDIÇOADOS & GOLEMS
  {
    id: 'cursed_beasts',
    name: 'Amaldiçoados & Golens de Pedra',
    category: 'cursed',
    type: 'common_monster',
    weaknessClasses: ['ranged', 'flying'],
    baseHealthFactor: 280,
    baseAttackFactor: 40,
    unitHealth: 280,
    unitAttack: 40,
    squadCountBase: 2,
    description: 'Monstros de rocha com carcaça pesada e alto HP.',
    specialTrait: 'Alta resistência a dano corpo a corpo.',
    defaultLevel: 10,
    defaultUnitCount: 1200,
  },

  // MONSTROS ÉPICOS
  {
    id: 'tinman',
    name: 'Homem de Lata Ancestral (Ancient Tinman)',
    category: 'epic',
    type: 'epic_monster',
    weaknessClasses: ['ranged'],
    baseHealthFactor: 16000,
    baseAttackFactor: 1100,
    unitHealth: 16000,
    unitAttack: 1100,
    squadCountBase: 4,
    description: 'Monstro Épico de Clã. Prioriza o squad de maior HP.',
    specialTrait: 'Ataque massivo em área no squad de maior HP.',
    defaultLevel: 15,
    defaultUnitCount: 1,
  },
  {
    id: 'fenrir',
    name: 'Lobo Fenrir Destruidor',
    category: 'epic',
    type: 'epic_monster',
    weaknessClasses: ['melee', 'mounted'],
    baseHealthFactor: 18000,
    baseAttackFactor: 1250,
    unitHealth: 18000,
    unitAttack: 1250,
    squadCountBase: 4,
    description: 'Fera colossal de gelo e fúria.',
    specialTrait: 'Fúria crescente a cada round.',
    defaultLevel: 20,
    defaultUnitCount: 1,
  },
  {
    id: 'jormungandr',
    name: 'Serpente do Mundo (Jörmungandr)',
    category: 'epic',
    type: 'epic_monster',
    weaknessClasses: ['ranged', 'flying'],
    baseHealthFactor: 24000,
    baseAttackFactor: 1600,
    unitHealth: 24000,
    unitAttack: 1600,
    squadCountBase: 6,
    description: 'Chefe titânico de torneio.',
    specialTrait: 'Veneno corrosivo em todas as tropas.',
    defaultLevel: 25,
    defaultUnitCount: 1,
  }
];

export function createMonsterInstance(
  archetype: MonsterArchetype,
  level: number,
  customUnitCount?: number
): MonsterTarget {
  const lvl = Math.max(1, Math.min(45, level));
  const count = customUnitCount !== undefined ? customUnitCount : (archetype.defaultUnitCount || 2300);

  const totalHealth = archetype.type === 'epic_monster'
    ? Math.round(archetype.baseHealthFactor * Math.pow(lvl, 1.65))
    : archetype.unitHealth * count;

  const baseAttack = archetype.type === 'epic_monster'
    ? Math.round(archetype.baseAttackFactor * Math.pow(lvl, 1.45))
    : archetype.unitAttack * count;

  const estimatedValorPoints = archetype.type === 'epic_monster'
    ? Math.round(lvl * lvl * 320 + 8000)
    : Math.round(lvl * 810); // 8.1K no Nível 10!

  const estimatedCaptainXP = archetype.type === 'epic_monster'
    ? Math.round(lvl * lvl * 650 + 15000)
    : Math.round(lvl * 1620); // 16.2K no Nível 10!

  const estimatedChestPoints = archetype.type === 'epic_monster'
    ? Math.round(lvl * 12 + 40)
    : Math.round(lvl * 2.5);

  const squadCount = archetype.type === 'epic_monster'
    ? Math.min(8, archetype.squadCountBase + Math.floor(lvl / 10))
    : Math.min(4, archetype.squadCountBase + Math.floor(lvl / 15));

  return {
    id: `${archetype.id}_lvl_${lvl}`,
    name: `${archetype.name} (Nível ${lvl})`,
    type: archetype.type,
    level: lvl,
    totalHealth,
    baseAttack,
    squadCount,
    weaknessClasses: archetype.weaknessClasses,
    estimatedValorPoints,
    estimatedChestPoints,
    estimatedCaptainXP,
    description: `${archetype.description} • ${archetype.specialTrait}`,
  };
}

export const DEFAULT_MONSTERS: MonsterTarget[] = MONSTER_ARCHETYPES.map((arch) =>
  createMonsterInstance(arch, arch.defaultLevel, arch.defaultUnitCount)
);
