import type { MonsterUnitDefinition } from "../src/data/monsters";

export type MonsterCatalogSeed = Omit<MonsterUnitDefinition, "avatarPath" | "detailImagePath"> & {
  avatarPath?: string;
  detailImagePath?: string;
};

// Catálogo legado completo usado apenas para inicializar bancos novos; o runtime lê do PostgreSQL.
export const MONSTER_CATALOG_SEED = [
  {
    "id": "cavalgante_lobo",
    "name": "Cavalgante de Lobo",
    "tier": 1,
    "family": "barbarian",
    "subType": "Unidade montada, Bárbaro",
    "troopClass": "mounted",
    "unitAttack": 150,
    "unitHealth": 450,
    "leadership": 3,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +60% | Força contra armas de cerco: +40%",
      "bonusVsSiegePercent": 40,
      "bonusVsRangedPercent": 60
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_lobo_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_lobo.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "goblin",
    "name": "Goblin",
    "tier": 1,
    "family": "barbarian",
    "subType": "Unidade corpo a corpo, Bárbaro",
    "troopClass": "melee",
    "unitAttack": 28,
    "unitHealth": 84,
    "leadership": 1,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +10%",
      "bonusVsMountedPercent": 10
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/goblin_avatar.png",
    "detailImagePath": "/assets/monsters/goblin.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "salteador_machado",
    "name": "Salteador do Machado",
    "tier": 1,
    "family": "barbarian",
    "subType": "Bárbaro, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 140,
    "unitHealth": 420,
    "leadership": 3,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +25%",
      "bonusVsMountedPercent": 25
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cacador_estepes",
    "name": "Caçador das Estepes",
    "tier": 2,
    "family": "barbarian",
    "subType": "Bárbaro, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 700,
    "unitHealth": 2100,
    "leadership": 8,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +30%",
      "bonusVsMeleePercent": 30
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "lancador_machados",
    "name": "Lançador de Machados",
    "tier": 2,
    "family": "barbarian",
    "subType": "Bárbaro, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 360,
    "unitHealth": 1080,
    "leadership": 4,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +45% | Força contra unidades voadoras: +50%",
      "bonusVsMeleePercent": 45,
      "bonusVsFlyingPercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/lancador_de_machados_avatar.png",
    "detailImagePath": "/assets/monsters/lancador_de_machados.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavaleiro_lobo",
    "name": "Cavaleiro de Lobo",
    "tier": 3,
    "family": "barbarian",
    "subType": "Bárbaro, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 4000,
    "unitHealth": 12000,
    "leadership": 25,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +50%",
      "bonusVsRangedPercent": 50
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "battle_boar",
    "name": "Javali de Batalha (Battle Boar)",
    "tier": 3,
    "family": "barbarian",
    "subType": "Fera, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 3900,
    "unitHealth": 11700,
    "leadership": 6,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +144% | Força contra unidades de longo alcance: +113%",
      "bonusVsRangedPercent": 113,
      "bonusVsMountedPercent": 144
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "ogro_xama",
    "name": "Ogro Xamã",
    "tier": 3,
    "family": "barbarian",
    "subType": "Unidade corpo a corpo, Bárbaro",
    "troopClass": "melee",
    "unitAttack": 3200,
    "unitHealth": 9600,
    "leadership": 20,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +60%",
      "bonusVsMountedPercent": 60
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/ogro_xama_avatar.png",
    "detailImagePath": "/assets/monsters/ogro_xama.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "berserker_colossal",
    "name": "Berserker Colossal",
    "tier": 4,
    "family": "barbarian",
    "subType": "Bárbaro Furioso, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 10500,
    "unitHealth": 31500,
    "leadership": 35,
    "initiative": 10,
    "aspects": {
      "description": "Fúria sangrenta: +60% vs montaria",
      "bonusVsMountedPercent": 60
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "corvo_tempestade",
    "name": "Corvo da Tempestade",
    "tier": 4,
    "family": "barbarian",
    "subType": "Fera, Unidade voadora, Bárbaro",
    "troopClass": "flying",
    "unitAttack": 13000,
    "unitHealth": 39000,
    "leadership": 44,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +55% | Força contra elementais: +45%",
      "bonusVsMeleePercent": 55,
      "bonusVsElementalsPercent": 45
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/corvo_da_tempestade_avatar.png",
    "detailImagePath": "/assets/monsters/corvo_da_tempestade.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_escorpiao",
    "name": "Cavalgante de Escorpião",
    "tier": 5,
    "family": "barbarian",
    "subType": "Unidade montada, Bárbaro",
    "troopClass": "mounted",
    "unitAttack": 37000,
    "unitHealth": 111000,
    "leadership": 71,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +40%",
      "bonusVsRangedPercent": 40
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_escorpiao_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_escorpiao.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "chefe_guerra_barbaro",
    "name": "Chefe de Guerra Bárbaro",
    "tier": 5,
    "family": "barbarian",
    "subType": "Bárbaro Supremo, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 24500,
    "unitHealth": 73500,
    "leadership": 60,
    "initiative": 10,
    "aspects": {
      "description": "Impacto devastador: +60%",
      "bonusVsRangedPercent": 60
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "abominacao",
    "name": "Abominação",
    "tier": 6,
    "family": "barbarian",
    "subType": "Fera, Unidade corpo a corpo, Bárbaro",
    "troopClass": "melee",
    "unitAttack": 130000,
    "unitHealth": 390000,
    "leadership": 135,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +60% | Força contra elementais: +50%",
      "bonusVsRangedPercent": 60,
      "bonusVsElementalsPercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/abominacao_avatar.png",
    "detailImagePath": "/assets/monsters/abominacao.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "ciclope",
    "name": "Ciclope",
    "tier": 6,
    "family": "barbarian",
    "subType": "Gigante, Bárbaro, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 45000,
    "unitHealth": 135000,
    "leadership": 85,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +45% | Força contra fortificações: +100% | Força contra feras: +40%",
      "bonusVsMeleePercent": 45,
      "bonusVsBeastsPercent": 40,
      "bonusVsFortificationsPercent": 100
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/ciclope_avatar.png",
    "detailImagePath": "/assets/monsters/ciclope.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "verme_areia",
    "name": "Verme da Areia",
    "tier": 7,
    "family": "barbarian",
    "subType": "Elemental, Unidade corpo a corpo, Bárbaro",
    "troopClass": "melee",
    "unitAttack": 430000,
    "unitHealth": 1290000,
    "leadership": 255,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +75% | Força contra dragões: +50%",
      "bonusVsDragonsPercent": 50,
      "bonusVsMountedPercent": 75
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/verme_da_areia_avatar.png",
    "detailImagePath": "/assets/monsters/verme_da_areia.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "esqueleto",
    "name": "Esqueleto",
    "tier": 1,
    "family": "cursed",
    "subType": "Amaldiçoado, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 56,
    "unitHealth": 168,
    "leadership": 2,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +15%",
      "bonusVsMountedPercent": 15
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/esqueleto_avatar.png",
    "detailImagePath": "/assets/monsters/esqueleto.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "feiticeiro",
    "name": "Feiticeiro",
    "tier": 1,
    "family": "cursed",
    "subType": "Amaldiçoado, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 150,
    "unitHealth": 450,
    "leadership": 3,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +25%",
      "bonusVsMeleePercent": 25
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/feiticeiro_avatar.png",
    "detailImagePath": "/assets/monsters/feiticeiro.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_jaguar",
    "name": "Cavalgante de Jaguar",
    "tier": 2,
    "family": "cursed",
    "subType": "Amaldiçoado, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 270,
    "unitHealth": 810,
    "leadership": 3,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +30%",
      "bonusVsRangedPercent": 30
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_jaguar_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_jaguar.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "licantropo",
    "name": "Licantropo",
    "tier": 2,
    "family": "cursed",
    "subType": "Fera, Amaldiçoado, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 360,
    "unitHealth": 1080,
    "leadership": 4,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +45%",
      "bonusVsMountedPercent": 45
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/licantropo_avatar.png",
    "detailImagePath": "/assets/monsters/licantropo.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_da_morte",
    "name": "Cavalgante da Morte",
    "tier": 3,
    "family": "cursed",
    "subType": "Amaldiçoado, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 3200,
    "unitHealth": 9600,
    "leadership": 20,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +50%",
      "bonusVsRangedPercent": 50
    },
    "aliases": [
      "Cavaleiro da Morte",
      "Cavaleiro",
      "Cavalgante"
    ],
    "avatarPath": "/assets/monsters/cavalgante_da_morte_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_da_morte.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "stone_gargoyle",
    "name": "Gárgula de Pedra (Stone Gargoyle)",
    "tier": 3,
    "family": "cursed",
    "subType": "Gigante, Unidade voadora",
    "troopClass": "flying",
    "unitAttack": 5200,
    "unitHealth": 15600,
    "leadership": 8,
    "initiative": 10,
    "aspects": {
      "description": "Força contra feras: +72% | Força contra corpo a corpo: +185%",
      "bonusVsMeleePercent": 185,
      "bonusVsBeastsPercent": 72
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "guerreiro_ossos",
    "name": "Guerreiro de Ossos",
    "tier": 3,
    "family": "cursed",
    "subType": "Amaldiçoado, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 3800,
    "unitHealth": 11400,
    "leadership": 22,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +40%",
      "bonusVsMountedPercent": 40
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "vampiro",
    "name": "Vampiro",
    "tier": 4,
    "family": "cursed",
    "subType": "Fera, Amaldiçoado, Unidade voadora",
    "troopClass": "flying",
    "unitAttack": 9900,
    "unitHealth": 29700,
    "leadership": 34,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +60% | Força contra elementais: +40%",
      "bonusVsMeleePercent": 60,
      "bonusVsElementalsPercent": 40
    },
    "aliases": [],
    "detailImagePath": "/assets/monsters/vampiro.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_touro",
    "name": "Cavalgante de Touro",
    "tier": 5,
    "family": "cursed",
    "subType": "Amaldiçoado, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 29000,
    "unitHealth": 87000,
    "leadership": 56,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +55%",
      "bonusVsRangedPercent": 55
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_touro_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_touro.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "rei_amaldicoado",
    "name": "Rei Amaldiçoado",
    "tier": 5,
    "family": "cursed",
    "subType": "Amaldiçoado Supremo, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 23500,
    "unitHealth": 70500,
    "leadership": 55,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +65%",
      "bonusVsRangedPercent": 65
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "emerald_dragon",
    "name": "Dragão Esmeralda (Emerald Dragon)",
    "tier": 3,
    "family": "dragons",
    "subType": "Dragão, Unidade voadora",
    "troopClass": "flying",
    "unitAttack": 4500,
    "unitHealth": 13500,
    "leadership": 7,
    "initiative": 10,
    "aspects": {
      "description": "Força contra gigantes: +72% | Força contra unidades montadas: +185%",
      "bonusVsGiantsPercent": 72,
      "bonusVsMountedPercent": 185
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "patrulheiro_elfo",
    "name": "Patrulheiro Élfico",
    "tier": 1,
    "family": "elemental",
    "subType": "Élfico, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 160,
    "unitHealth": 480,
    "leadership": 3,
    "initiative": 11,
    "aspects": {
      "description": "Flechas precisas: +30% vs corpo a corpo",
      "bonusVsMeleePercent": 30
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "guardiao_pedra",
    "name": "Guardião de Pedra",
    "tier": 2,
    "family": "elemental",
    "subType": "Elemental, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 750,
    "unitHealth": 2250,
    "leadership": 8,
    "initiative": 9,
    "aspects": {
      "description": "Pele rochosa: +35% vs montadas",
      "bonusVsMountedPercent": 35
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavaleiro_grifo",
    "name": "Cavaleiro de Grifo",
    "tier": 3,
    "family": "elemental",
    "subType": "Élfico / Fera, Unidade voadora",
    "troopClass": "flying",
    "unitAttack": 4200,
    "unitHealth": 12600,
    "leadership": 26,
    "initiative": 12,
    "aspects": {
      "description": "Mergulho aéreo: +45%",
      "bonusVsMeleePercent": 45
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "elemental_fogo",
    "name": "Elemental de Fogo Primordial",
    "tier": 4,
    "family": "elemental",
    "subType": "Elemental, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 10600,
    "unitHealth": 31800,
    "leadership": 36,
    "initiative": 10,
    "aspects": {
      "description": "Chamas consumidoras: +60%",
      "bonusVsMeleePercent": 60
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "anciao_floresta",
    "name": "Ancião Guardião da Floresta",
    "tier": 5,
    "family": "elemental",
    "subType": "Elemental Titânico, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 25000,
    "unitHealth": 75000,
    "leadership": 65,
    "initiative": 9,
    "aspects": {
      "description": "Raízes esmagadoras: +65%",
      "bonusVsMountedPercent": 65
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "anao",
    "name": "Anão",
    "tier": 1,
    "family": "elfos",
    "subType": "Elfos, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 28,
    "unitHealth": 84,
    "leadership": 1,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +10%",
      "bonusVsMountedPercent": 10
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "arqueiro_elfico",
    "name": "Arqueiro Élfico",
    "tier": 1,
    "family": "elfos",
    "subType": "Elfos, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 100,
    "unitHealth": 300,
    "leadership": 2,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +35%",
      "bonusVsMeleePercent": 35
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/arqueiro_elfico_avatar.png",
    "detailImagePath": "/assets/monsters/arqueiro_elfico.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "druida",
    "name": "Druida",
    "tier": 2,
    "family": "elfos",
    "subType": "Elfos, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 900,
    "unitHealth": 2700,
    "leadership": 10,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +25%",
      "bonusVsMeleePercent": 25
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/druida_avatar.png",
    "detailImagePath": "/assets/monsters/druida.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "centauro",
    "name": "Centauro",
    "tier": 3,
    "family": "elfos",
    "subType": "Elfos, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 2600,
    "unitHealth": 7800,
    "leadership": 16,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +50% | Força contra armas de cerco: +20%",
      "bonusVsSiegePercent": 20,
      "bonusVsRangedPercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/centauro_avatar.png",
    "detailImagePath": "/assets/monsters/centauro.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_pegaso",
    "name": "Cavalgante de Pégaso",
    "tier": 4,
    "family": "elfos",
    "subType": "Unidade voadora, Elfos",
    "troopClass": "flying",
    "unitAttack": 8200,
    "unitHealth": 24600,
    "leadership": 28,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +60% | Força contra dragões: +50%",
      "bonusVsMeleePercent": 60,
      "bonusVsDragonsPercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_pegaso_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_pegaso.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_unicornio",
    "name": "Cavalgante de Unicórnio",
    "tier": 5,
    "family": "elfos",
    "subType": "Elfos, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 27000,
    "unitHealth": 81000,
    "leadership": 51,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +65%",
      "bonusVsRangedPercent": 65
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_unicornio_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_unicornio.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "ent",
    "name": "Ent",
    "tier": 6,
    "family": "elfos",
    "subType": "Elemental, Elfos, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 73000,
    "unitHealth": 219000,
    "leadership": 77,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +55% | Força contra dragões: +45%",
      "bonusVsRangedPercent": 55,
      "bonusVsDragonsPercent": 45
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/ent_avatar.png",
    "detailImagePath": "/assets/monsters/ent.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "dragao_vida",
    "name": "Dragão da Vida",
    "tier": 7,
    "family": "elfos",
    "subType": "Dragão, Unidade voadora, Elfos",
    "troopClass": "flying",
    "unitAttack": 240000,
    "unitHealth": 720000,
    "leadership": 139,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +60% | Força contra gigantes: +50%",
      "bonusVsGiantsPercent": 50,
      "bonusVsMountedPercent": 60
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/dragao_da_vida_avatar.png",
    "detailImagePath": "/assets/monsters/dragao_da_vida.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "arachne_unit",
    "name": "Aracne Tecedora das Sombras",
    "tier": 5,
    "family": "epic",
    "subType": "Fera Aracnídea Épica",
    "troopClass": "ranged",
    "unitAttack": 1400,
    "unitHealth": 21000,
    "leadership": 110,
    "initiative": 11,
    "aspects": {
      "description": "Teia imobilizadora que reduz a iniciativa das tropas inimigas."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cerberus_unit",
    "name": "Cérbero Guardião do Submundo",
    "tier": 5,
    "family": "epic",
    "subType": "Fera Demoníaca Épica",
    "troopClass": "melee",
    "unitAttack": 1550,
    "unitHealth": 23000,
    "leadership": 115,
    "initiative": 10,
    "aspects": {
      "description": "Tríplice mordida que atinge 3 esquadrões simultaneamente."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "phoenix_unit",
    "name": "Fênix Solar Ancestral",
    "tier": 5,
    "family": "epic",
    "subType": "Fera Solar Sagrada",
    "troopClass": "flying",
    "unitAttack": 1700,
    "unitHealth": 26000,
    "leadership": 125,
    "initiative": 12,
    "aspects": {
      "description": "Explosão de cinzas flamejantes ao receber dano letal."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "tinman_unit",
    "name": "Homem de Lata Ancestral (Tinman)",
    "tier": 5,
    "family": "epic",
    "subType": "Colossal Mecânico Épico",
    "troopClass": "melee",
    "unitAttack": 1100,
    "unitHealth": 16000,
    "leadership": 100,
    "initiative": 10,
    "aspects": {
      "description": "Ataque em área que prioriza o esquadrão com maior HP."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "fenrir_unit",
    "name": "Lobo Fenrir Destruidor",
    "tier": 5,
    "family": "epic",
    "subType": "Fera Épica de Gelo",
    "troopClass": "mounted",
    "unitAttack": 1250,
    "unitHealth": 18000,
    "leadership": 100,
    "initiative": 10,
    "aspects": {
      "description": "Fúria elemental que dobra o dano a cada 3 rounds."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "jormungandr_unit",
    "name": "Serpente do Mundo (Jörmungandr)",
    "tier": 5,
    "family": "epic",
    "subType": "Serpente Titânica dos Mares",
    "troopClass": "flying",
    "unitAttack": 1600,
    "unitHealth": 24000,
    "leadership": 120,
    "initiative": 10,
    "aspects": {
      "description": "Veneno corrosivo que causa dano contínuo em todas as tropas."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "ancient_terror_unit",
    "name": "Terror Ancestral / Juízo Final",
    "tier": 5,
    "family": "epic",
    "subType": "Titã Supremo do Juízo Final",
    "troopClass": "melee",
    "unitAttack": 2100,
    "unitHealth": 32000,
    "leadership": 150,
    "initiative": 10,
    "aspects": {
      "description": "Golpe cataclísmico que causa dano massivo em linha."
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "demonio",
    "name": "Demônio",
    "tier": 1,
    "family": "inferno",
    "subType": "Demônio, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 28,
    "unitHealth": 84,
    "leadership": 1,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +15%",
      "bonusVsMountedPercent": 15
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/demonio_avatar.png",
    "detailImagePath": "/assets/monsters/demonio.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "magogue",
    "name": "Magogue",
    "tier": 1,
    "family": "inferno",
    "subType": "Demônio, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 50,
    "unitHealth": 150,
    "leadership": 1,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +30%",
      "bonusVsMeleePercent": 30
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "demonio_chifres",
    "name": "Demônio com Chifres",
    "tier": 2,
    "family": "inferno",
    "subType": "Demônio, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 720,
    "unitHealth": 2160,
    "leadership": 8,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +40%",
      "bonusVsMountedPercent": 40
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/demonio_com_chifres_avatar.png",
    "detailImagePath": "/assets/monsters/demonio_com_chifres.png",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "capataz",
    "name": "Capataz",
    "tier": 3,
    "family": "inferno",
    "subType": "Demônio, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 6500,
    "unitHealth": 19500,
    "leadership": 40,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +70%",
      "bonusVsMeleePercent": 70
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/capataz_avatar.png",
    "detailImagePath": "/assets/monsters/capataz.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_fogo",
    "name": "Cavalgante de Fogo",
    "tier": 3,
    "family": "inferno",
    "subType": "Demônio, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 4100,
    "unitHealth": 12300,
    "leadership": 25,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +50%",
      "bonusVsRangedPercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_fogo_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_fogo.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "pitonisa_fogo",
    "name": "Pitonisa de Fogo",
    "tier": 4,
    "family": "inferno",
    "subType": "Demônio, Unidade voadora",
    "troopClass": "flying",
    "unitAttack": 10200,
    "unitHealth": 30600,
    "leadership": 35,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +60%",
      "bonusVsMeleePercent": 60
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cerbero_demonio",
    "name": "Cérbero",
    "tier": 5,
    "family": "inferno",
    "subType": "Fera, Demônio, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 17000,
    "unitHealth": 51000,
    "leadership": 58,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +65% | Força contra elementais: +50%",
      "bonusVsRangedPercent": 65,
      "bonusVsElementalsPercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cerbero_avatar.png",
    "detailImagePath": "/assets/monsters/cerbero.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "senhor_inferno",
    "name": "Senhor do Abismo",
    "tier": 5,
    "family": "inferno",
    "subType": "Demônio Colossal, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 24000,
    "unitHealth": 72000,
    "leadership": 60,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +60%",
      "bonusVsMountedPercent": 60
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_verme_fogo",
    "name": "Cavalgante de Verme de Fogo",
    "tier": 6,
    "family": "inferno",
    "subType": "Demônio, Unidade montada",
    "troopClass": "mounted",
    "unitAttack": 50000,
    "unitHealth": 150000,
    "leadership": 96,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +55%",
      "bonusVsRangedPercent": 55
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/cavalgante_de_verme_de_fogo_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_verme_de_fogo.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "banshee",
    "name": "Banshee",
    "tier": 1,
    "family": "undead",
    "subType": "Morto-Vivo, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 100,
    "unitHealth": 300,
    "leadership": 2,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +45%",
      "bonusVsMeleePercent": 45
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/banshee_avatar.png",
    "detailImagePath": "/assets/monsters/banshee.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "carnical",
    "name": "Carniçal",
    "tier": 1,
    "family": "undead",
    "subType": "Fera, Unidade corpo a corpo, Morto-vivo",
    "troopClass": "melee",
    "unitAttack": 28,
    "unitHealth": 84,
    "leadership": 1,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +10%",
      "bonusVsMountedPercent": 10
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/carnical_avatar.png",
    "detailImagePath": "/assets/monsters/carnical.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "esqueleto_guerreiro",
    "name": "Esqueleto Guerreiro",
    "tier": 1,
    "family": "undead",
    "subType": "Morto-Vivo, Unidade corpo a corpo",
    "troopClass": "melee",
    "unitAttack": 120,
    "unitHealth": 360,
    "leadership": 2,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +20%",
      "bonusVsMountedPercent": 20
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_de_cao_da_morte",
    "name": "Cavalgante de Cão da Morte",
    "tier": 2,
    "family": "undead",
    "subType": "Unidade montada, Morto-vivo",
    "troopClass": "mounted",
    "unitAttack": 1100,
    "unitHealth": 3300,
    "leadership": 12,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +40%",
      "bonusVsRangedPercent": 40
    },
    "aliases": [
      "Cavaleiro de Cão da Morte",
      "Cão da Morte",
      "cavalgante_cao_morte"
    ],
    "avatarPath": "/assets/monsters/cavalgante_de_cao_da_morte_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_de_cao_da_morte.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "esqueleto_arqueiro",
    "name": "Esqueleto Arqueiro",
    "tier": 2,
    "family": "undead",
    "subType": "Morto-Vivo, Unidade de longo alcance",
    "troopClass": "ranged",
    "unitAttack": 650,
    "unitHealth": 1950,
    "leadership": 7,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +30%",
      "bonusVsMeleePercent": 30
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "necromante",
    "name": "Necromante",
    "tier": 2,
    "family": "undead",
    "subType": "Unidade de longo alcance, Morto-vivo",
    "troopClass": "ranged",
    "unitAttack": 720,
    "unitHealth": 2160,
    "leadership": 8,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades corpo a corpo: +50%",
      "bonusVsMeleePercent": 50
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/necromante_avatar.png",
    "detailImagePath": "/assets/monsters/necromante.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "carrasco",
    "name": "Carrasco",
    "tier": 3,
    "family": "undead",
    "subType": "Unidade corpo a corpo, Morto-vivo",
    "troopClass": "melee",
    "unitAttack": 2300,
    "unitHealth": 6900,
    "leadership": 14,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +45%",
      "bonusVsMountedPercent": 45
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/carrasco_avatar.png",
    "detailImagePath": "/assets/monsters/carrasco.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "cavalgante_das_trevas",
    "name": "Cavalgante das Trevas",
    "tier": 4,
    "family": "undead",
    "subType": "Unidade montada, Morto-vivo",
    "troopClass": "mounted",
    "unitAttack": 5800,
    "unitHealth": 17400,
    "leadership": 20,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades de longo alcance: +50%",
      "bonusVsRangedPercent": 50
    },
    "aliases": [
      "Cavaleiro das Trevas",
      "Cavaleiro da Morte",
      "Cavalgante",
      "cavalgante_trevas"
    ],
    "avatarPath": "/assets/monsters/cavalgante_das_trevas_avatar.png",
    "detailImagePath": "/assets/monsters/cavalgante_das_trevas.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "lich_ancestral",
    "name": "Lich Ancestral",
    "tier": 4,
    "family": "undead",
    "subType": "Morto-Vivo, Feiticeiro Voador",
    "troopClass": "flying",
    "unitAttack": 9800,
    "unitHealth": 29400,
    "leadership": 32,
    "initiative": 10,
    "aspects": {
      "description": "Dano sombrio em área: +55%",
      "bonusVsMeleePercent": 55
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "dracolich",
    "name": "Dracolich Titânico",
    "tier": 5,
    "family": "undead",
    "subType": "Morto-Vivo, Dragão Esqueleto",
    "troopClass": "flying",
    "unitAttack": 25000,
    "unitHealth": 75000,
    "leadership": 65,
    "initiative": 10,
    "aspects": {
      "description": "Baforada espectral corrosiva: +65%",
      "bonusVsMeleePercent": 65
    },
    "aliases": [],
    "isEnemy": true,
    "unitType": "enemy_monster"
  },
  {
    "id": "gargula",
    "name": "Gárgula",
    "tier": 5,
    "family": "undead",
    "subType": "Fera, Unidade voadora, Morto-vivo",
    "troopClass": "flying",
    "unitAttack": 19000,
    "unitHealth": 57000,
    "leadership": 37,
    "initiative": 10,
    "aspects": {
      "description": "Força contra unidades montadas: +70% | Força contra elementais: +45%",
      "bonusVsMountedPercent": 70,
      "bonusVsElementalsPercent": 45
    },
    "aliases": [],
    "avatarPath": "/assets/monsters/gargula_avatar.png",
    "detailImagePath": "/assets/monsters/gargula.jpg",
    "isEnemy": true,
    "unitType": "enemy_monster"
  }
] satisfies MonsterCatalogSeed[];
