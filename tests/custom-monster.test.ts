import { describe, it, expect, beforeEach } from 'vitest';
import {
  MONSTER_PRESET_TEMPLATES,
  buildMonsterTargetFromTemplate,
  saveCustomMonsterSquads,
  getSavedCustomSquads,
  hasSavedCustomSquads,
  removeSavedCustomMonsterSquads,
  saveCustomMonsterVariant,
  getSavedCustomVariants,
  setActiveCustomVariant,
  removeSavedCustomMonsterVariant,
  type EnemySquadUnit,
} from '../src/data/monsters';

describe('Custom Monster Target Persistence', () => {
  const barbarianTemplate = MONSTER_PRESET_TEMPLATES.find((t) => t.id === 'tropa_barbaros_rara')!;
  const testLevel = 4;

  beforeEach(() => {
    // Clear test saved targets in localStorage mock
    removeSavedCustomMonsterSquads(barbarianTemplate.id, testLevel);
  });

  it('initializes with clean empty squads when no custom configuration is saved', () => {
    const target = buildMonsterTargetFromTemplate(barbarianTemplate, testLevel);
    expect(target.level).toBe(testLevel);
    expect(target.isCustomConfig).toBe(false);
    expect(target.enemySquads).toBeDefined();
    expect(target.enemySquads).toHaveLength(0);
  });

  it('saves and automatically loads custom monster squad composition for specific level', () => {
    const customSquads: EnemySquadUnit[] = [
      {
        id: 'ogro_custom_1',
        name: 'Ogro Xamã',
        tier: 3,
        family: 'barbarian',
        troopClass: 'melee',
        unitAttack: 12800,
        unitHealth: 38400,
        leadership: 10,
        initiative: 10,
        count: 4,
      },
      {
        id: 'cavalgante_custom_2',
        name: 'Cavalgante de Lobo',
        tier: 1,
        family: 'barbarian',
        troopClass: 'mounted',
        unitAttack: 5850,
        unitHealth: 17550,
        leadership: 4,
        initiative: 10,
        count: 39,
      },
    ];

    saveCustomMonsterSquads(barbarianTemplate.id, testLevel, customSquads);

    expect(hasSavedCustomSquads(barbarianTemplate.id, testLevel)).toBe(true);
    expect(getSavedCustomSquads(barbarianTemplate.id, testLevel)).toHaveLength(2);

    const loadedTarget = buildMonsterTargetFromTemplate(barbarianTemplate, testLevel);
    expect(loadedTarget.isCustomConfig).toBe(true);
    expect(loadedTarget.enemySquads).toHaveLength(2);
    expect(loadedTarget.enemySquads![0].name).toBe('Ogro Xamã');
    expect(loadedTarget.enemySquads![0].count).toBe(4);
    expect(loadedTarget.enemySquads![1].name).toBe('Cavalgante de Lobo');
    expect(loadedTarget.enemySquads![1].count).toBe(39);
  });

  it('reverts to unconfigured state when saved custom configuration is removed', () => {
    const customSquads: EnemySquadUnit[] = [
      {
        id: 'goblin_custom',
        name: 'Goblin',
        tier: 1,
        family: 'barbarian',
        troopClass: 'melee',
        unitAttack: 28,
        unitHealth: 84,
        leadership: 1,
        initiative: 10,
        count: 100,
      },
    ];

    saveCustomMonsterSquads(barbarianTemplate.id, testLevel, customSquads);
    expect(hasSavedCustomSquads(barbarianTemplate.id, testLevel)).toBe(true);

    removeSavedCustomMonsterSquads(barbarianTemplate.id, testLevel);
    expect(hasSavedCustomSquads(barbarianTemplate.id, testLevel)).toBe(false);

    const reverted = buildMonsterTargetFromTemplate(barbarianTemplate, testLevel);
    expect(reverted.isCustomConfig).toBe(false);
    expect(reverted.enemySquads).toHaveLength(0);
  });

  it('supports saving multiple distinct monster squads/teams on the SAME level without overwriting', () => {
    const team1Squads: EnemySquadUnit[] = [
      {
        id: 'carnical_custom',
        name: 'Carniçal',
        tier: 1,
        family: 'undead',
        troopClass: 'melee',
        unitAttack: 28,
        unitHealth: 84,
        leadership: 1,
        initiative: 10,
        count: 50,
      },
    ];

    const team2Squads: EnemySquadUnit[] = [
      {
        id: 'banshee_custom',
        name: 'Banshee',
        tier: 2,
        family: 'undead',
        troopClass: 'ranged',
        unitAttack: 110,
        unitHealth: 330,
        leadership: 2,
        initiative: 10,
        count: 80,
      },
    ];

    // Save Team 1
    const var1 = saveCustomMonsterVariant(barbarianTemplate.id, testLevel, team1Squads, 'Equipe 1');
    expect(var1.name).toBe('Equipe 1');

    // Save Team 2 on SAME level
    const var2 = saveCustomMonsterVariant(barbarianTemplate.id, testLevel, team2Squads, 'Equipe 2 (Banshee)');
    expect(var2.name).toBe('Equipe 2 (Banshee)');

    // Verify both variants exist on this level
    const variants = getSavedCustomVariants(barbarianTemplate.id, testLevel);
    expect(variants).toHaveLength(2);
    expect(variants[0].name).toBe('Equipe 1');
    expect(variants[1].name).toBe('Equipe 2 (Banshee)');

    // Active variant is var2 (most recently saved)
    let loaded = buildMonsterTargetFromTemplate(barbarianTemplate, testLevel);
    expect(loaded.activeVariantName).toBe('Equipe 2 (Banshee)');
    expect(loaded.enemySquads![0].name).toBe('Banshee');

    // Switch active back to Team 1
    setActiveCustomVariant(barbarianTemplate.id, testLevel, var1.id);
    loaded = buildMonsterTargetFromTemplate(barbarianTemplate, testLevel);
    expect(loaded.activeVariantName).toBe('Equipe 1');
    expect(loaded.enemySquads![0].name).toBe('Carniçal');

    // Remove only Team 1, Team 2 remains intact
    removeSavedCustomMonsterVariant(barbarianTemplate.id, testLevel, var1.id);
    const remaining = getSavedCustomVariants(barbarianTemplate.id, testLevel);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Equipe 2 (Banshee)');
  });
});
