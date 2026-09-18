import React, { useState } from 'react';
import { Shield, Swords, Crosshair, Compass, Zap, Users } from 'lucide-react';

interface TroopAvatarProps {
  id: string;
  tier?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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

  // Unidades Pesadas & Cerco
  g1_heavy: '/assets/troops/swordman_I.png',
  g1_siege: '/assets/troops/swordman_II.png',

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

  // Monstros & Mercenários
  m3_golem: '/assets/troops/berserker.png',
  m3_specter: '/assets/troops/berserker.png',
  m3_beast: '/assets/troops/berserker.png',
  m5_titan: '/assets/troops/berserker.png',
  water_elemental: '/assets/troops/water_elemental.png',
  epic_monster_hunter_v: '/assets/troops/epic_monter_hunter_V.png',
  epic_monter_hunter_V: '/assets/troops/epic_monter_hunter_V.png',
  berserker: '/assets/troops/berserker.png',
  berserker_monstro: '/assets/troops/berserker.png',

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

export const TroopAvatar: React.FC<TroopAvatarProps> = ({ id, tier, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-20 h-20'
      : size === 'xl'
      ? 'w-28 h-28'
      : 'w-16 h-16';

  const tierSizeClass =
    size === 'sm'
      ? 'text-[8px] px-1 py-0.2'
      : size === 'lg' || size === 'xl'
      ? 'text-xs px-2 py-0.5'
      : 'text-[10px] px-1.5 py-0.5';

  const getTierRoman = (t?: number | string) => {
    if (!t) return null;
    const num = Number(t);
    switch (num) {
      case 1: return 'I';
      case 2: return 'II';
      case 3: return 'III';
      case 4: return 'IV';
      case 5: return 'V';
      case 6: return 'VI';
      case 7: return 'VII';
      case 8: return 'VIII';
      case 9: return 'IX';
      default: return String(t);
    }
  };

  const getTierColor = (t?: number | string) => {
    const num = Number(t);
    switch (num) {
      case 1: return 'bg-stone-800 text-stone-200 border-stone-500';
      case 2: return 'bg-emerald-950 text-emerald-300 border-emerald-500';
      case 3: return 'bg-blue-950 text-blue-300 border-blue-500';
      case 4: return 'bg-purple-950 text-purple-300 border-purple-500';
      case 5: return 'bg-amber-950 text-amber-300 border-amber-500';
      case 6: return 'bg-red-950 text-red-300 border-red-500';
      case 7: return 'bg-yellow-500 text-slate-950 font-black border-yellow-300';
      default: return 'bg-slate-800 text-slate-200 border-slate-600';
    }
  };

  const realImgSrc = REAL_TROOP_IMAGES[id] || `/assets/troops/${id}.png`;

  const romanTier = getTierRoman(tier);

  return (
    <div
      className={`relative ${sizeClasses} rounded-xl border border-slate-700 bg-slate-950 shadow-md flex-shrink-0 overflow-hidden ring-1 ring-black/40 ${className}`}
    >
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

      {/* Roman Tier Badge in Top Left Corner */}
      {romanTier && (
        <div
          className={`absolute top-0 left-0 ${tierSizeClass} rounded-br-lg border-r border-b font-black flex items-center justify-center shadow-md ${getTierColor(
            tier
          )}`}
        >
          {romanTier}
        </div>
      )}
    </div>
  );
};
