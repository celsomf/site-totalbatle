import { Captain } from '../types';

export const DEFAULT_CAPTAINS: Captain[] = [
  // 1. Brunhild (Lvl 25)
  {
    id: 'brunhild',
    name: 'Brunhild',
    level: 25,
    specialty: 'monsters',
    monsterAttackBonusPercent: 30,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 20,
    description: 'Valquíria de Combate. Bônus de liderança, ataque corpo-a-corpo e caçada a monstros.',
    avatarIcon: '/assets/troops/brunhild.png',
  },
  // 2. Xi Guiying (Lvl 23)
  {
    id: 'xi_guiying',
    name: 'Xi Guiying',
    level: 23,
    specialty: 'monsters',
    monsterAttackBonusPercent: 28,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Guerreira Heroica Oriental. Especialista em bônus para infantaria e caça a monstros.',
    avatarIcon: '/assets/troops/xi_guiying.png',
  },
  // 3. Aydae (Lvl 23)
  {
    id: 'aydae',
    name: 'Aydae',
    level: 23,
    specialty: 'monsters',
    monsterAttackBonusPercent: 28,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Arqueira Mística. Especialista em bônus para arqueiros e caça a monstros.',
    avatarIcon: '/assets/troops/aydae.png',
  },
  // 3. Farhad (Lvl 20)
  {
    id: 'farhad',
    name: 'Farhad',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 20,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Capitão combatente versátil para expedições e ataques de monstros.',
    avatarIcon: '/assets/troops/farhad.png',
  },
  // 4. Alexander
  {
    id: 'alexander',
    name: 'Alexander',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 15,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Grande Conquistador. Especialista em liderança de exércitos e combate em campo aberto.',
    avatarIcon: '/assets/troops/alexander.png',
  },
  // 5. Amanitore
  {
    id: 'amanitore',
    name: 'Amanitore',
    level: 20,
    specialty: 'economy',
    monsterAttackBonusPercent: 12,
    cryptTarReductionPercent: 5,
    marchSpeedBonusPercent: 10,
    description: 'Rainha Construtora. Acelera construção e fornece bônus defensivos.',
    avatarIcon: '/assets/troops/amanitore.png',
  },
  // 6. Aurora
  {
    id: 'aurora',
    name: 'Aurora',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 22,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 12,
    description: 'Sacerdotisa da Luz. Cura acelerada e bônus contra forças das trevas.',
    avatarIcon: '/assets/troops/aurora.png',
  },
  // 7. Beowulf
  {
    id: 'beowulf',
    name: 'Beowulf',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 26,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 10,
    description: 'Matador de Feras lendário. Bônus massivo contra monstros épicos.',
    avatarIcon: '/assets/troops/beowulf.png',
  },
  // 8. Bernard
  {
    id: 'bernard',
    name: 'Bernard',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 25,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 10,
    description: 'Mestre Arqueiro. Bônus massivo para tropas de Longo Alcance (Ranged).',
    avatarIcon: '/assets/troops/bernard.png',
  },
  // 9. Brann
  {
    id: 'brann',
    name: 'Brann',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 16,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 12,
    description: 'Mestre da Forja e Cerco. Aumenta poder de máquinas de guerra e catapultas.',
    avatarIcon: '/assets/troops/brann.png',
  },
  // 10. Carter
  {
    id: 'carter',
    name: 'Carter',
    level: 30,
    specialty: 'crypts',
    monsterAttackBonusPercent: 10,
    cryptTarReductionPercent: 30,
    marchSpeedBonusPercent: 25,
    description: 'Arqueólogo Explorador. Reduz consumo de Alcatrão (Tar) em criptas em até 30%.',
    avatarIcon: '/assets/troops/carter.png',
  },
  // 11. Cleopatra
  {
    id: 'cleopatra',
    name: 'Cleopatra',
    level: 25,
    specialty: 'economy',
    monsterAttackBonusPercent: 15,
    cryptTarReductionPercent: 10,
    marchSpeedBonusPercent: 15,
    description: 'Rainha do Nilo. Bônus econômico e equilíbrio geral para todas as tropas.',
    avatarIcon: '/assets/troops/cleopatra.png',
  },
  // 12. Dustan
  {
    id: 'dustan',
    name: 'Dustan',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 20,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 12,
    description: 'Ranger das Planícies. Rastreamento e bônus de ataque rápido.',
    avatarIcon: '/assets/troops/dustan.png',
  },
  // 13. Heimdall
  {
    id: 'heimdall',
    name: 'Heimdall',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 18,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Guardião dos Reinos. Defesa intransponível para a cidade e muralhas.',
    avatarIcon: '/assets/troops/heimdall.png',
  },
  // 14. Helen
  {
    id: 'helen',
    name: 'Helen',
    level: 20,
    specialty: 'economy',
    monsterAttackBonusPercent: 14,
    cryptTarReductionPercent: 5,
    marchSpeedBonusPercent: 15,
    description: 'Inspiradora das tropas. Aumenta moral e capacidade de transporte.',
    avatarIcon: '/assets/troops/helen.png',
  },
  // 15. Hercules
  {
    id: 'hercules',
    name: 'Hercules',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 28,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 10,
    description: 'Semideus da Força. Bônus titânico de ataque corpo-a-corpo.',
    avatarIcon: '/assets/troops/hercules.png',
  },
  // 16. Ingrid
  {
    id: 'ingrid',
    name: 'Ingrid',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 24,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Guerreira do Norte. Resiliência contra magias elementais.',
    avatarIcon: '/assets/troops/ingrid.png',
  },
  // 17. Logos
  {
    id: 'logos',
    name: 'Logos',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 15,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 10,
    description: 'Mestre Tático. Bônus especial para unidades Especialistas (S1-S7).',
    avatarIcon: '/assets/troops/logos.png',
  },
  // 20. Lucius
  {
    id: 'lucius',
    name: 'Lucius',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 17,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 12,
    description: 'Comandante de Legião. Fortalece a formação de infantaria pesada.',
    avatarIcon: '/assets/troops/lucius.png',
  },
  // 21. Minamoto
  {
    id: 'minamoto',
    name: 'Minamoto',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 20,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 20,
    description: 'Senhor da Guerra Samurai. Ataques rápidos e precisos.',
    avatarIcon: '/assets/troops/minamoto.png',
  },
  // 22. Proscope
  {
    id: 'proscope',
    name: 'Proscope',
    level: 20,
    specialty: 'crypts',
    monsterAttackBonusPercent: 12,
    cryptTarReductionPercent: 20,
    marchSpeedBonusPercent: 20,
    description: 'Navegador Noturno. Eficiência em criptas e marcha veloz.',
    avatarIcon: '/assets/troops/proscope.png',
  },
  // 23. Ramses II
  {
    id: 'ramses_II',
    name: 'Ramses II',
    level: 20,
    specialty: 'economy',
    monsterAttackBonusPercent: 18,
    cryptTarReductionPercent: 5,
    marchSpeedBonusPercent: 15,
    description: 'Faraó Construtor de Monumentos. Bônus imperial e glória de marcha.',
    avatarIcon: '/assets/troops/ramses_II.png',
  },
  // 24. Skadi
  {
    id: 'skadi',
    name: 'Skadi',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 26,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Deusa da Caça na Neve. Bônus crítico em arqueiros e caçadas.',
    avatarIcon: '/assets/troops/skadi.png',
  },
  // 25. Sofia
  {
    id: 'sofia',
    name: 'Sofia',
    level: 20,
    specialty: 'economy',
    monsterAttackBonusPercent: 14,
    cryptTarReductionPercent: 10,
    marchSpeedBonusPercent: 15,
    description: 'Erudita Real. Pesquisa acelerada e diplomacia.',
    avatarIcon: '/assets/troops/sofia.png',
  },
  // 26. Stror
  {
    id: 'stror',
    name: 'Stror',
    level: 20,
    specialty: 'pvp',
    monsterAttackBonusPercent: 18,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 10,
    description: 'Anão das Montanhas. Especialista em fortificações e defesa pesada.',
    avatarIcon: '/assets/troops/stror.png',
  },
  // 27. Tengel
  {
    id: 'tengel',
    name: 'Tengel',
    level: 20,
    specialty: 'speed',
    monsterAttackBonusPercent: 10,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 35,
    description: 'Mestre da Cavalaria. Aumenta a velocidade de todas as marchas em até 35%.',
    avatarIcon: '/assets/troops/tengel.png',
  },
  // 28. Wu Zetian
  {
    id: 'wu_zetian',
    name: 'Wu Zetian',
    level: 20,
    specialty: 'economy',
    monsterAttackBonusPercent: 16,
    cryptTarReductionPercent: 8,
    marchSpeedBonusPercent: 15,
    description: 'Imperatriz Suprema. Liderança administrativa e poder em campanhas militares.',
    avatarIcon: '/assets/troops/wu_zetian.png',
  },
  // 27. Ye Ho-Sung
  {
    id: 'ye_ho_sung',
    name: 'Ye Ho-Sung',
    level: 20,
    specialty: 'monsters',
    monsterAttackBonusPercent: 24,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 18,
    description: 'General do Vento. Ataques fulminantes contra exércitos de monstros.',
    avatarIcon: '/assets/troops/ye_ho_sung.png',
  },
];

export interface HeroInfo {
  id: 'garvel' | 'julia';
  name: string;
  gender: 'male' | 'female';
  title: string;
  image: string;
  description: string;
}

export const DEFAULT_HEROES: HeroInfo[] = [
  {
    id: 'garvel',
    name: 'Garvel',
    gender: 'male',
    title: 'Guerreiro & Senhor da Guerra',
    image: '/assets/troops/garvel.png',
    description: 'Herói masculino inicial do Total Battle. Lidera a cidade e as marchas de guerra.',
  },
  {
    id: 'julia',
    name: 'Julia',
    gender: 'female',
    title: 'Comandante Imperial & Estrategista',
    image: '/assets/troops/julia.png',
    description: 'Heroína feminina inicial do Total Battle. Lidera a cidade e expedições táticas.',
  },
];
