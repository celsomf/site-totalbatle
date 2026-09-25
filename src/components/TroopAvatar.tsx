import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface TroopAvatarProps {
  id: string;
  tier?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  levelBadge?: number | string;
  className?: string;
}

const REAL_TROOP_IMAGES: Record<string, string> = {
  // Arqueiros (Tier I - V)
  g1_ranged: '/assets/troops/archer_I.png',
  g2_ranged: '/assets/troops/archer_II.png',
  g3_ranged: '/assets/troops/archer_III.png',
  g4_ranged: '/assets/troops/archer_IV.png',
  g5_ranged: '/assets/troops/archer_V.png',
  archer_I: '/assets/troops/archer_I.png',
  archer_II: '/assets/troops/archer_II.png',
  archer_III: '/assets/troops/archer_III.png',
  archer_IV: '/assets/troops/archer_IV.png',
  archer_V: '/assets/troops/archer_V.png',

  // Espadachins & Guerreiros (Especialistas S1 - S5)
  s1_swordsman: '/assets/troops/swordman_I.png',
  s2_swordsman: '/assets/troops/swordman_II.png',
  s3_swordsman: '/assets/troops/swordman_III.png',
  s4_swordsman: '/assets/troops/swordman_IV.png',
  s5_swordsman: '/assets/troops/swordman_V.png',
  swordman_I: '/assets/troops/swordman_I.png',
  swordman_II: '/assets/troops/swordman_II.png',
  swordman_III: '/assets/troops/swordman_III.png',
  swordman_IV: '/assets/troops/swordman_IV.png',
  swordman_V: '/assets/troops/swordman_V.png',

  // Lanceiros (Guardas G1 - G5)
  g1_melee: '/assets/troops/sperman_I.png',
  g2_melee: '/assets/troops/sperman_II.png',
  g3_melee: '/assets/troops/sperman_III.png',
  g4_melee: '/assets/troops/sperman_IV.png',
  g5_melee: '/assets/troops/sperman_V.png',
  sperman_I: '/assets/troops/sperman_I.png',
  sperman_II: '/assets/troops/sperman_II.png',
  sperman_III: '/assets/troops/sperman_III.png',
  sperman_IV: '/assets/troops/sperman_IV.png',
  sperman_V: '/assets/troops/sperman_V.png',

  // Cavaleiros / Montados (Tier I - V)
  g1_mounted: '/assets/troops/rider_I.png',
  g2_mounted: '/assets/troops/rider_II.png',
  g3_mounted: '/assets/troops/rider_IIII.png',
  g4_mounted: '/assets/troops/rider_IV.png',
  g5_mounted: '/assets/troops/rider_V.png',
  rider_I: '/assets/troops/rider_I.png',
  rider_II: '/assets/troops/rider_II.png',
  rider_III: '/assets/troops/rider_IIII.png',
  rider_IV: '/assets/troops/rider_IV.png',
  rider_V: '/assets/troops/rider_V.png',
  s1_mounted: '/assets/troops/rider_I.png',
  s2_mounted: '/assets/troops/rider_II.png',
  s3_mounted: '/assets/troops/rider_IIII.png',
  s4_mounted: '/assets/troops/rider_IV.png',
  s5_mounted: '/assets/troops/rider_V.png',

  // Espias / Assassinos / Batedores (Tier I - V)
  s1_spy: '/assets/troops/spies_I.png',
  s2_spy: '/assets/troops/spies_II.png',
  s3_spy: '/assets/troops/spies_III.png',
  s4_spy: '/assets/troops/spies_IV.png',
  s5_spy: '/assets/troops/spies_V.png',
  s1_assassin: '/assets/troops/spies_I.png',
  spies_I: '/assets/troops/spies_I.png',
  spies_II: '/assets/troops/spies_II.png',
  spies_III: '/assets/troops/spies_III.png',
  spies_IV: '/assets/troops/spies_IV.png',
  spies_V: '/assets/troops/spies_V.png',

  // Tiro Mortal (Deadshot S1 - S5)
  s1_deadshot: '/assets/troops/archer_I.png',
  s2_deadshot: '/assets/troops/archer_II.png',
  s3_deadshot: '/assets/troops/archer_III.png',
  s4_deadshot: '/assets/troops/archer_IV.png',
  s5_deadshot: '/assets/troops/archer_V.png',

  // Unidades Pesadas & Cerco / Catapultas
  g1_heavy: '/assets/troops/swordman_I.png',
  g1_siege: '/assets/troops/catapult_I.png',
  g2_siege: '/assets/troops/catapult_II.png',
  g3_siege: '/assets/troops/catapult_III.png',
  g4_siege: '/assets/troops/catapult_IV.png',
  g5_siege: '/assets/troops/catapult_V.png',
  icon_g1_siege: '/assets/troops/catapult_I.png',
  icon_g2_siege: '/assets/troops/catapult_II.png',
  icon_g3_siege: '/assets/troops/catapult_III.png',
  icon_g4_siege: '/assets/troops/catapult_IV.png',
  icon_g5_siege: '/assets/troops/catapult_V.png',
  catapult_I: '/assets/troops/catapult_I.png',
  catapult_II: '/assets/troops/catapult_II.png',
  catapult_III: '/assets/troops/catapult_III.png',
  catapult_IV: '/assets/troops/catapult_IV.png',
  catapult_V: '/assets/troops/catapult_V.png',
  catapult: '/assets/troops/catapult_I.png',
  catapulta: '/assets/troops/catapult_I.png',
  catapulta_I: '/assets/troops/catapult_I.png',
  catapulta_II: '/assets/troops/catapult_II.png',
  catapulta_III: '/assets/troops/catapult_III.png',
  catapulta_IV: '/assets/troops/catapult_IV.png',
  catapulta_V: '/assets/troops/catapult_V.png',
  trabuco: '/assets/troops/catapult_I.png',
  trabuco_I: '/assets/troops/catapult_I.png',
  trabuco_II: '/assets/troops/catapult_II.png',
  trabuco_III: '/assets/troops/catapult_III.png',
  trabuco_IV: '/assets/troops/catapult_IV.png',
  trabuco_V: '/assets/troops/catapult_V.png',


  // Guardas Avançados (T6-T7 / P1-P2)
  besteiro_pesado_VI: '/assets/troops/g6_ranged.png',
  besteiro_pesado_VII: '/assets/troops/g7_ranged.png',
  purificador_I: '/assets/troops/g7_ranged.png',
  purificador_II: '/assets/troops/g7_ranged.png',
  alabardeiro_pesado_VI: '/assets/troops/g6_melee.png',
  justiceiro_I: '/assets/troops/g7_melee.png',
  cavaleiro_montado_VI: '/assets/troops/g6_mounted.png',
  cavaleiro_montado_VII: '/assets/troops/g7_mounted.png',
  triturador_I: '/assets/troops/g7_mounted.png',
  triturador_II: '/assets/troops/g7_mounted.png',
  grifo_V: '/assets/troops/g5_flying.png',
  grifo_VI: '/assets/troops/g7_flying.png',
  grifo_VII: '/assets/troops/g7_flying.png',
  corvo_I: '/assets/troops/g7_flying.png',

  g5_flying: '/assets/troops/g5_flying.png',
  g6_flying: '/assets/troops/g7_flying.png',
  g7_flying: '/assets/troops/g7_flying.png',
  g8_flying: '/assets/troops/g7_flying.png',
  g6_ranged: '/assets/troops/g6_ranged.png',
  g7_ranged: '/assets/troops/g7_ranged.png',
  g8_ranged: '/assets/troops/g7_ranged.png',
  g9_ranged: '/assets/troops/g7_ranged.png',
  g6_melee: '/assets/troops/g6_melee.png',
  g7_melee: '/assets/troops/g7_melee.png',
  g8_melee: '/assets/troops/g7_melee.png',
  g6_mounted: '/assets/troops/g6_mounted.png',
  g7_mounted: '/assets/troops/g7_mounted.png',
  g8_mounted: '/assets/troops/g7_mounted.png',
  g9_mounted: '/assets/troops/g7_mounted.png',

  // Especialistas Mapeados
  deadshot_I: '/assets/troops/archer_I.png',
  deadshot_II: '/assets/troops/archer_II.png',
  deadshot_III: '/assets/troops/archer_III.png',
  deadshot_IV: '/assets/troops/archer_IV.png',
  deadshot_V: '/assets/troops/archer_V.png',
  deadshot_VI: '/assets/troops/archer_V.png',
  deadshot_VII: '/assets/troops/archer_V.png',
  legitimist_I: '/assets/troops/archer_V.png',
  legitimist_II: '/assets/troops/archer_V.png',

  heavy_knight_VI: '/assets/troops/swordman_V.png',
  heavy_knight_VII: '/assets/troops/swordman_V.png',
  duelist_I: '/assets/troops/swordman_V.png',
  duelist_II: '/assets/troops/swordman_V.png',

  lion_rider_I: '/assets/troops/rider_I.png',
  lion_rider_II: '/assets/troops/rider_II.png',
  lion_rider_III: '/assets/troops/rider_IIII.png',
  lion_rider_IV: '/assets/troops/rider_IV.png',
  lion_rider_V: '/assets/troops/rider_V.png',
  lion_rider_VI: '/assets/troops/rider_V.png',
  lion_rider_VII: '/assets/troops/rider_V.png',
  whitemane_I: '/assets/troops/rider_V.png',
  whitemane_II: '/assets/troops/rider_V.png',

  vulture_V: '/assets/troops/g5_flying.png',
  vulture_VI: '/assets/troops/g7_flying.png',
  vulture_VII: '/assets/troops/g7_flying.png',
  royal_lion_I: '/assets/troops/g7_flying.png',
  royal_lion_II: '/assets/troops/g7_flying.png',

  swift_jaeger_VI: '/assets/troops/spies_V.png',
  swift_jaeger_VII: '/assets/troops/spies_V.png',
  panoptic_I: '/assets/troops/spies_V.png',

  // Monstros & Mercenários & Dragões
  m3_golem: '/assets/troops/berserker.png',
  m3_specter: '/assets/troops/berserker.png',
  m3_beast: '/assets/troops/berserker.png',
  m5_titan: '/assets/troops/berserker.png',
  water_elemental: '/assets/troops/water_elemental.png',
  epic_monster_hunter_v: '/assets/troops/epic_monter_hunter_V.png',
  epic_monter_hunter_V: '/assets/troops/epic_monter_hunter_V.png',
  berserker: '/assets/troops/berserker.png',
  berserker_monstro: '/assets/troops/berserker.png',
  emerald_dragon: '/assets/troops/emerald_dragon.png',
  emeraldDragon: '/assets/troops/emerald_dragon.png',
  dragao_esmeralda: '/assets/troops/emerald_dragon.png',
  dragao_vida: '/assets/monsters/dragao_da_vida_avatar.png',
  dragao_da_vida: '/assets/monsters/dragao_da_vida_avatar.png',
  life_dragon: '/assets/monsters/dragao_da_vida_avatar.png',
  arqueiro_elfico: '/assets/monsters/arqueiro_elfico_avatar.png',
  banshee: '/assets/monsters/banshee_avatar.png',
  capataz: '/assets/monsters/capataz_avatar.png',
  carnical: '/assets/monsters/carnical_avatar.png',
  carrasco: '/assets/monsters/carrasco_avatar.png',
  cavalgante_da_morte: '/assets/monsters/cavalgante_da_morte_avatar.png',
  cavaleiro_morte: '/assets/monsters/cavalgante_da_morte_avatar.png',
  cavaleiro_da_morte: '/assets/monsters/cavalgante_da_morte_avatar.png',
  cavaleiro_trevas: '/assets/monsters/cavalgante_das_trevas_avatar.png',
  cavaleiro_das_trevas: '/assets/monsters/cavalgante_das_trevas_avatar.png',
  cavalgante_cao_morte: '/assets/monsters/cavalgante_de_cao_da_morte_avatar.png',
  cavalgante_de_cao_da_morte: '/assets/monsters/cavalgante_de_cao_da_morte_avatar.png',
  cavalgante_fogo: '/assets/monsters/cavalgante_de_fogo_avatar.png',
  cavalgante_de_fogo: '/assets/monsters/cavalgante_de_fogo_avatar.png',
  cavalgante_jaguar: '/assets/monsters/cavalgante_de_jaguar_avatar.png',
  cavalgante_de_jaguar: '/assets/monsters/cavalgante_de_jaguar_avatar.png',
  cavalgante_trevas: '/assets/monsters/cavalgante_das_trevas_avatar.png',
  cavalgante_das_trevas: '/assets/monsters/cavalgante_das_trevas_avatar.png',
  cavalgante_escorpiao: '/assets/monsters/cavalgante_de_escorpiao_avatar.png',
  cavalgante_de_escorpiao: '/assets/monsters/cavalgante_de_escorpiao_avatar.png',
  scorpion_rider: '/assets/monsters/cavalgante_de_escorpiao_avatar.png',
  cavalgante_lobo: '/assets/monsters/cavalgante_de_lobo_avatar.png',
  cavalgante_de_lobo: '/assets/monsters/cavalgante_de_lobo_avatar.png',
  wolf_rider: '/assets/monsters/cavalgante_de_lobo_avatar.png',
  cavalgante_pegaso: '/assets/monsters/cavalgante_de_pegaso_avatar.png',
  cavalgante_de_pegaso: '/assets/monsters/cavalgante_de_pegaso_avatar.png',
  cavalgante_touro: '/assets/monsters/cavalgante_de_touro_avatar.png',
  cavalgante_de_touro: '/assets/monsters/cavalgante_de_touro_avatar.png',
  bull_rider: '/assets/monsters/cavalgante_de_touro_avatar.png',
  cavalgante_unicornio: '/assets/monsters/cavalgante_de_unicornio_avatar.png',
  cavalgante_de_unicornio: '/assets/monsters/cavalgante_de_unicornio_avatar.png',
  unicorn_rider: '/assets/monsters/cavalgante_de_unicornio_avatar.png',
  cavalgante_verme_fogo: '/assets/monsters/cavalgante_de_verme_de_fogo_avatar.png',
  cavalgante_de_verme_de_fogo: '/assets/monsters/cavalgante_de_verme_de_fogo_avatar.png',
  fire_worm_rider: '/assets/monsters/cavalgante_de_verme_de_fogo_avatar.png',
  centauro: '/assets/monsters/centauro_avatar.png',
  centaur: '/assets/monsters/centauro_avatar.png',
  cerbero: '/assets/monsters/cerbero_avatar.png',
  cerbero_demonio: '/assets/monsters/cerbero_avatar.png',
  cerberus: '/assets/monsters/cerbero_avatar.png',
  cerberus_unit: '/assets/monsters/cerbero_avatar.png',
  ciclope: '/assets/monsters/ciclope_avatar.png',
  cyclops: '/assets/monsters/ciclope_avatar.png',
  corvo_tempestade: '/assets/monsters/corvo_da_tempestade_avatar.png',
  corvo_da_tempestade: '/assets/monsters/corvo_da_tempestade_avatar.png',
  cervo_tempestade: '/assets/monsters/corvo_da_tempestade_avatar.png',
  cervo_da_tempestade: '/assets/monsters/corvo_da_tempestade_avatar.png',
  storm_crow: '/assets/monsters/corvo_da_tempestade_avatar.png',
  demonio: '/assets/monsters/demonio_avatar.png',
  demon: '/assets/monsters/demonio_avatar.png',
  demonio_chifres: '/assets/monsters/demonio_com_chifres_avatar.png',
  demonio_com_chifres: '/assets/monsters/demonio_com_chifres_avatar.png',
  horned_demon: '/assets/monsters/demonio_com_chifres_avatar.png',
  druida: '/assets/monsters/druida_avatar.png',
  druid: '/assets/monsters/druida_avatar.png',
  ent: '/assets/monsters/ent_avatar.png',
  esqueleto: '/assets/monsters/esqueleto_avatar.png',
  skeleton: '/assets/monsters/esqueleto_avatar.png',
  feiticeiro: '/assets/monsters/feiticeiro_avatar.png',
  sorcerer: '/assets/monsters/feiticeiro_avatar.png',
  witch_doctor: '/assets/monsters/feiticeiro_avatar.png',
  gargula: '/assets/monsters/gargula_avatar.png',
  gargoyle: '/assets/monsters/gargula_avatar.png',
  goblin: '/assets/monsters/goblin_avatar.png',
  lancador_machados: '/assets/monsters/lancador_de_machados_avatar.png',
  lancador_de_machados: '/assets/monsters/lancador_de_machados_avatar.png',
  axe_thrower: '/assets/monsters/lancador_de_machados_avatar.png',
  licantropo: '/assets/monsters/licantropo_avatar.png',
  lincantropo: '/assets/monsters/licantropo_avatar.png',
  lycanthrope: '/assets/monsters/licantropo_avatar.png',
  necromante: '/assets/monsters/necromante_avatar.png',
  necromancer: '/assets/monsters/necromante_avatar.png',
  abominacao: '/assets/monsters/abominacao_avatar.png',
  ogro_xama: '/assets/monsters/ogro_xama_avatar.png',
  verme_areia: '/assets/monsters/verme_da_areia_avatar.png',
  sandworm: '/assets/monsters/verme_da_areia_avatar.png',
  m3_dragon: '/assets/troops/emerald_dragon.png',
  stone_gargoyle: '/assets/troops/stone_gargoyle.png',
  stoneGargoyle: '/assets/troops/stone_gargoyle.png',
  gargula_de_pedra: '/assets/troops/stone_gargoyle.png',
  battle_boar: '/assets/troops/battle_boar.png',
  battleBoar: '/assets/troops/battle_boar.png',
  javali_de_batalha: '/assets/troops/battle_boar.png',
  swift_marksman: '/assets/troops/swift_marksman.png',
  swiftMarksman: '/assets/troops/swift_marksman.png',
  atirador_veloz: '/assets/troops/swift_marksman.png',
  merc_swift_marksman: '/assets/troops/swift_marksman.png',


  // Capitães Oficiais
  alexander: '/assets/troops/alexander.png',
  amanitore: '/assets/troops/amanitore.png',
  aurora: '/assets/troops/aurora.png',
  aydae: '/assets/troops/aydae.png',
  beowulf: '/assets/troops/beowulf.png',
  bernard: '/assets/troops/bernard.png',
  brann: '/assets/troops/brann.png',
  brunhild: '/assets/troops/brunhild.png',
  carter: '/assets/troops/carter.png',
  cleopatra: '/assets/troops/cleopatra.png',
  dustan: '/assets/troops/dustan.png',
  farhad: '/assets/troops/farhad.png',
  garvel: '/assets/troops/garvel.png',
  heimdall: '/assets/troops/heimdall.png',
  helen: '/assets/troops/helen.png',
  hercules: '/assets/troops/hercules.png',
  ingrid: '/assets/troops/ingrid.png',
  julia: '/assets/troops/julia.png',
  logos: '/assets/troops/logos.png',
  lucius: '/assets/troops/lucius.png',
  minamoto: '/assets/troops/minamoto.png',
  proscope: '/assets/troops/proscope.png',
  ramses_II: '/assets/troops/ramses_II.png',
  skadi: '/assets/troops/skadi.png',
  sofia: '/assets/troops/sofia.png',
  stror: '/assets/troops/stror.png',
  tengel: '/assets/troops/tengel.png',
  wu_zetian: '/assets/troops/wu_zetian.png',
  xi_guiying: '/assets/troops/xi_guiying.png',
  ye_ho_sung: '/assets/troops/ye_ho_sung.png',
};

function getTroopImageSrc(id: string): string {
  if (!id) return '';
  if (REAL_TROOP_IMAGES[id]) return REAL_TROOP_IMAGES[id];

  const lower = id.toLowerCase();
  if (REAL_TROOP_IMAGES[lower]) return REAL_TROOP_IMAGES[lower];

  // Strip dynamic suffix like necromante_172000_0 or cavalgante_unicornio_1_11
  const cleanId = lower.replace(/_\d+.*$/, '');
  if (REAL_TROOP_IMAGES[cleanId]) return REAL_TROOP_IMAGES[cleanId];

  // Slugify from name (e.g. "Lançador de Machados" -> "lancador_de_machados")
  const slug = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (REAL_TROOP_IMAGES[slug]) return REAL_TROOP_IMAGES[slug];

  const cleanSlug = slug.replace(/_\d+.*$/, '');
  if (REAL_TROOP_IMAGES[cleanSlug]) return REAL_TROOP_IMAGES[cleanSlug];

  const withoutArticles = slug.replace(/_(de|da|do|das|dos|com)_/g, '_');
  if (REAL_TROOP_IMAGES[withoutArticles]) return REAL_TROOP_IMAGES[withoutArticles];

  return `/assets/troops/${id}.png`;
}

export const TroopAvatar: React.FC<TroopAvatarProps> = ({
  id,
  size = 'md',
  levelBadge,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const realImgSrc = getTroopImageSrc(id);

  React.useEffect(() => {
    setImgError(false);
  }, [realImgSrc]);

  const sizeClasses =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-20 h-20'
      : size === 'xl'
      ? 'w-28 h-28'
      : 'w-16 h-16';

  return (
    <div className={`relative ${sizeClasses} flex-shrink-0 ${className}`}>
      <div className="w-full h-full rounded-xl border border-slate-700 bg-slate-950 shadow-md overflow-hidden ring-1 ring-black/40">
        {realImgSrc && !imgError ? (
          <img
            src={realImgSrc}
            alt={id}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-2">
            <Shield className="w-6 h-6 text-amber-400/80 mb-1" />
            <span className="text-[9px] font-bold text-slate-300 uppercase truncate max-w-full">
              {id.replace(/^(g[0-9]_|s[0-9]_|m[0-9]_)/, '')}
            </span>
          </div>
        )}
      </div>

      {levelBadge !== undefined && levelBadge !== null && (
        <div
          className="absolute -top-1.5 -right-1.5 z-20 bg-gradient-to-b from-amber-700 via-yellow-800 to-amber-950 border border-amber-300 text-amber-100 font-mono font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded shadow-xl flex items-center justify-center pointer-events-none ring-1 ring-black/60"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {levelBadge}
        </div>
      )}
    </div>
  );
};
