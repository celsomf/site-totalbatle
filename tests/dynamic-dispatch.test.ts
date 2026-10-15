import { describe, it, expect } from 'vitest';
import { buildDispatchedTroops, simulateCombat } from '../src/utils/combatSimulator';
import { TroopUnit, PlayerProfile, MonsterTarget, Captain } from '../src/types';
import { DEFAULT_MONSTERS, MONSTER_PRESET_TEMPLATES, buildMonsterTargetFromTemplate } from '../src/data/monsters';
import { DEFAULT_CAPTAINS } from '../src/data/captains';
import { DEFAULT_TROOPS } from '../src/data/troops';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';

describe('Motor de Despacho Dinâmico de Tropas e Combate', () => {
  const profile: PlayerProfile = createCleanProfile('test_player');
  const captain: Captain = DEFAULT_CAPTAINS[0]; // Farhad
  const targetMonster: MonsterTarget = {
    ...DEFAULT_MONSTERS[0],
    enemySquads: [
      {
        id: 'banshee_test',
        name: 'Banshee',
        tier: 1,
        family: 'undead',
        subType: 'Espectro, Longo Alcance',
        troopClass: 'ranged',
        unitAttack: 45,
        unitHealth: 135,
        leadership: 1,
        initiative: 10,
        count: 500,
        aspects: { bonusVsMeleePercent: 45, description: '+45% vs Melee' },
      },
      {
        id: 'esqueleto_test',
        name: 'Guerreiro Esqueleto',
        tier: 1,
        family: 'undead',
        subType: 'Esqueleto, Corpo a Corpo',
        troopClass: 'melee',
        unitAttack: 28,
        unitHealth: 84,
        leadership: 1,
        initiative: 10,
        count: 500,
        aspects: { bonusVsMountedPercent: 15, description: '+15% vs Montadas' },
      },
    ],
    totalHealth: 67500,
    baseAttack: 22500,
  };

  it('deve utilizar tropas adicionadas de tiers superiores (G3, G4, etc.) quando disponíveis no estoque', () => {
    // Clonamos as tropas e colocamos estoque em G3 Ranged e G1 Lanceiro
    const troops: TroopUnit[] = DEFAULT_TROOPS.map((t) => {
      if (t.id === 'g3_ranged') return { ...t, ownedCount: 2000, isUnlocked: true };
      if (t.id === 'g1_melee') return { ...t, ownedCount: 500, isUnlocked: true };
      return { ...t, ownedCount: 0 };
    });

    const dispatched = buildDispatchedTroops(troops, profile, targetMonster, captain, true);

    // Deve conter o G3 Ranged despachado como tropa principal de dano
    const g3Dispatched = dispatched.find((t) => t.id === 'g3_ranged');
    expect(g3Dispatched).toBeDefined();
    expect(g3Dispatched?.count).toBeGreaterThan(0);
    expect(g3Dispatched?.tier).toBe(3);

    // Deve conter bucha G1
    const g1Dispatched = dispatched.find((t) => t.id === 'g1_melee');
    expect(g1Dispatched).toBeDefined();
    expect(g1Dispatched?.count).toBeGreaterThan(0);
  });

  it('respeita os custos de Liderança, Autoridade e Dominância ao preencher cada limite', () => {
    const constrainedProfile: PlayerProfile = {
      ...profile,
      maxMarchCapacity: 5,
      mercenaryCapacity: 2,
      specialCapacity: 4,
    };
    const target = {
      ...targetMonster,
      enemySquads: [
        {
          id: 'chimera_capacity_test',
          name: 'Chimera de teste',
          tier: 6,
          family: 'epic' as const,
          troopClass: 'melee' as const,
          unitAttack: 100000,
          unitHealth: 300000,
          count: 100000,
          initiative: 10,
          leadership: 74,
        },
        {
          id: 'harpy_capacity_test',
          name: 'Harpy de teste',
          tier: 3,
          family: 'epic' as const,
          troopClass: 'ranged' as const,
          unitAttack: 100000,
          unitHealth: 300000,
          count: 100000,
          initiative: 10,
          leadership: 10,
        },
      ],
    };
    const troops = DEFAULT_TROOPS.map((troop) => ({
      ...troop,
      ownedCount: troop.id === 'g1_ranged' ? 1
        : troop.id === 'g2_mounted' ? 10
        : troop.id === 'epic_monster_hunter_v' ? 10
        : troop.id === 'm3_golem' ? 10
        : 0,
      isUnlocked: true,
    }));

    const dispatched = buildDispatchedTroops(troops, constrainedProfile, target, captain, false);
    const usedByCategory = (category: 'guardsman' | 'specialist' | 'mercenary' | 'monster') =>
      dispatched
        .filter((troop) => troop.category === category)
        .reduce((sum, troop) => sum + troop.count * (troop.leadershipCost || 1), 0);

    expect(usedByCategory('guardsman') + usedByCategory('specialist')).toBeLessThanOrEqual(5);
    expect(usedByCategory('mercenary')).toBeLessThanOrEqual(2);
    expect(usedByCategory('monster')).toBeLessThanOrEqual(4);
    // A busca pode deixar capacidade livre se o resultado não piorar.
    expect(simulateCombat(dispatched, target.enemySquads).outcome).toBe('DEFEAT');
    for (const sent of dispatched) {
      expect(Number.isInteger(sent.count)).toBe(true);
      expect(sent.count).toBeLessThanOrEqual(troops.find((troop) => troop.id === sent.id)!.ownedCount);
    }
  });

  it('deve utilizar tropas customizadas criadas pelo usuário', () => {
    const customTroop: TroopUnit = {
      id: 'custom_dragon_knight',
      name: 'Cavaleiro Dragão Ancestral',
      category: 'specialist',
      tier: 5,
      troopClass: 'mounted',
      baseAttack: 1200,
      baseHealth: 3600,
      ownedCount: 800,
      isUnlocked: true,
      revivalSilverCost: 100,
      revivalGoldCost: 10,
      leadershipCost: 2,
    };

    const troops: TroopUnit[] = [
      ...DEFAULT_TROOPS.map((t) => ({ ...t, ownedCount: 0 })),
      customTroop,
      { ...DEFAULT_TROOPS.find((t) => t.id === 'g1_melee')!, ownedCount: 300, isUnlocked: true },
    ];

    const dispatched = buildDispatchedTroops(troops, profile, targetMonster, captain, true);

    const customDispatched = dispatched.find((t) => t.id === 'custom_dragon_knight');
    expect(customDispatched).toBeDefined();
    expect(customDispatched?.count).toBeGreaterThan(0);
    expect(customDispatched?.count).toBeLessThan(customTroop.ownedCount);
    expect(customDispatched?.unitAttack).toBeGreaterThan(1200); // Com bônus de dragão + capitão
  });

  it('deve simular o combate com vitória ao despachar exército forte de tiers superiores contra monstro de nível compatível', () => {
    const level5Target = buildMonsterTargetFromTemplate(MONSTER_PRESET_TEMPLATES[0], 5);
    level5Target.enemySquads = [
      {
        id: 'demonio_test',
        name: 'Demônio',
        tier: 1,
        family: 'inferno',
        subType: 'Demônio, Unidade corpo a corpo',
        troopClass: 'melee',
        unitAttack: 28,
        unitHealth: 84,
        leadership: 1,
        initiative: 10,
        count: 100,
      },
    ];
    level5Target.totalHealth = 8400;
    level5Target.baseAttack = 2800;

    const troops: TroopUnit[] = DEFAULT_TROOPS.map((t) => {
      if (t.id === 'g4_ranged') return { ...t, ownedCount: 3000, isUnlocked: true };
      if (t.id === 'g1_melee') return { ...t, ownedCount: 500, isUnlocked: true };
      return { ...t, ownedCount: 0 };
    });

    const dispatched = buildDispatchedTroops(troops, profile, level5Target, captain, true);
    const simResult = simulateCombat(dispatched, level5Target.enemySquads || []);

    expect(simResult.outcome).toBe('VICTORY');
    expect(simResult.totalPlayerDamage).toBeGreaterThan(simResult.initialEnemyHp);
  });
});
