import React, { useState } from 'react';

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

  // Espadachins & Guerreiros (Tier I - V)
  g1_melee: '/assets/troops/swordman_I.png',
  g2_melee: '/assets/troops/swordman_II.png',
  g3_melee: '/assets/troops/swordman_III.png',
  g4_melee: '/assets/troops/swordman_IV.png',
  g5_melee: '/assets/troops/swordman_V.png',
  swordman_I: '/assets/troops/swordman_I.png',
  swordman_II: '/assets/troops/swordman_II.png',
  swordman_III: '/assets/troops/swordman_III.png',
  swordman_IV: '/assets/troops/swordman_IV.png',
  swordman_V: '/assets/troops/swordman_V.png',

  // Lanceiros (Tier I - V)
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

  // Espias / Assassinos (Tier I - V)
  s1_assassin: '/assets/troops/spies_I.png',
  spies_I: '/assets/troops/spies_I.png',
  spies_II: '/assets/troops/spies_II.png',
  spies_III: '/assets/troops/spies_III.png',
  spies_IV: '/assets/troops/spies_IV.png',
  spies_V: '/assets/troops/spies_V.png',

  // Unidades Pesadas & Cerco
  g1_heavy: '/assets/troops/icon_g1_heavy.png',
  g1_siege: '/assets/troops/icon_g1_siege.png',

  // Guardas Avançados (T5-T9 / P1-P2)
  besteiro_pesado_VI: '/assets/troops/besteiro_pesado_VI.png',
  besteiro_pesado_VII: '/assets/troops/besteiro_pesado_VII.png',
  purificador_I: '/assets/troops/purificador_I.png',
  purificador_II: '/assets/troops/purificador_II.png',
  alabardeiro_pesado_VI: '/assets/troops/alabardeiro_pesado_VI.png',
  justiceiro_I: '/assets/troops/justiceiro_I.png',
  cavaleiro_montado_VI: '/assets/troops/cavaleiro_montado_VI.png',
  cavaleiro_montado_VII: '/assets/troops/cavaleiro_montado_VII.png',
  triturador_I: '/assets/troops/triturador_I.png',
  triturador_II: '/assets/troops/triturador_II.png',
  grifo_V: '/assets/troops/grifo_V.png',
  grifo_VI: '/assets/troops/grifo_VI.png',
  grifo_VII: '/assets/troops/grifo_VII.png',
  corvo_I: '/assets/troops/corvo_I.png',

  g5_flying: '/assets/troops/grifo_V.png',
  g6_flying: '/assets/troops/grifo_VI.png',
  g7_flying: '/assets/troops/grifo_VII.png',
  g8_flying: '/assets/troops/corvo_I.png',
  g6_ranged: '/assets/troops/besteiro_pesado_VI.png',
  g7_ranged: '/assets/troops/besteiro_pesado_VII.png',
  g8_ranged: '/assets/troops/purificador_I.png',
  g9_ranged: '/assets/troops/purificador_II.png',
  g6_melee: '/assets/troops/alabardeiro_pesado_VI.png',
  g8_melee: '/assets/troops/justiceiro_I.png',
  g6_mounted: '/assets/troops/cavaleiro_montado_VI.png',
  g7_mounted: '/assets/troops/cavaleiro_montado_VII.png',
  g8_mounted: '/assets/troops/triturador_I.png',
  g9_mounted: '/assets/troops/triturador_II.png',

  // Especialistas Mapeados
  deadshot_I: '/assets/troops/archer_I.png',
  deadshot_II: '/assets/troops/archer_II.png',
  deadshot_III: '/assets/troops/archer_III.png',
  deadshot_IV: '/assets/troops/archer_IV.png',
  deadshot_V: '/assets/troops/deadshot_V.png',
  deadshot_VI: '/assets/troops/deadshot_VI.png',
  deadshot_VII: '/assets/troops/deadshot_VII.png',
  legitimist_I: '/assets/troops/legitimist_I.png',
  legitimist_II: '/assets/troops/legitimist_II.png',

  heavy_knight_VI: '/assets/troops/heavy_knight_VI.png',
  heavy_knight_VII: '/assets/troops/heavy_knight_VII.png',
  duelist_I: '/assets/troops/duelist_I.png',
  duelist_II: '/assets/troops/duelist_II.png',

  lion_rider_I: '/assets/troops/rider_I.png',
  lion_rider_II: '/assets/troops/rider_II.png',
  lion_rider_III: '/assets/troops/rider_IIII.png',
  lion_rider_IV: '/assets/troops/rider_IV.png',
  lion_rider_V: '/assets/troops/lion_rider_V.png',
  lion_rider_VI: '/assets/troops/lion_rider_VI.png',
  lion_rider_VII: '/assets/troops/lion_rider_VII.png',
  whitemane_I: '/assets/troops/whitemane_I.png',
  whitemane_II: '/assets/troops/whitemane_II.png',

  vulture_V: '/assets/troops/vulture_V.png',
  vulture_VI: '/assets/troops/vulture_VI.png',
  vulture_VII: '/assets/troops/vulture_VII.png',
  royal_lion_I: '/assets/troops/royal_lion_I.png',
  royal_lion_II: '/assets/troops/royal_lion_II.png',

  swift_jaeger_VI: '/assets/troops/swift_jaeger_VI.png',
  swift_jaeger_VII: '/assets/troops/swift_jaeger_VII.png',
  panoptic_I: '/assets/troops/panoptic_I.png',

  // Monstros & Mercenários
  m3_golem: '/assets/troops/m3_golem.png',
  m3_specter: '/assets/troops/m3_specter.png',
  m3_beast: '/assets/troops/m3_beast.png',
  m5_titan: '/assets/troops/m5_titan.png',
  water_elemental: '/assets/troops/water_elemental.png',
  epic_monster_hunter_v: '/assets/troops/epic_monter_hunter_V.png',
  epic_monter_hunter_V: '/assets/troops/epic_monter_hunter_V.png',
  berserker: '/assets/troops/berserker.png',
  berserker_monstro: '/assets/troops/berserker.png',

  // Capitães Oficiais do Jogo
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

  // Alvo Inimigo Magogue
  magogue: '/assets/troops/magogue.png',
  magogue_inferno: '/assets/troops/magogue.png',
  inferno_squad: '/assets/troops/magogue.png',
};

export const TroopAvatar: React.FC<TroopAvatarProps> = ({ id, tier, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-24 h-24'
      : size === 'xl'
      ? 'w-32 h-32'
      : 'w-16 h-16';

  const tierSizeClass =
    size === 'sm'
      ? 'text-[8px] w-4 h-4'
      : size === 'lg' || size === 'xl'
      ? 'text-xs w-6 h-6'
      : 'text-[10px] w-5 h-5';

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
      default: return String(t);
    }
  };

  const getTierColor = (t?: number | string) => {
    const num = Number(t);
    switch (num) {
      case 1: return 'bg-stone-700 text-stone-200 border-stone-400';
      case 2: return 'bg-emerald-800 text-emerald-100 border-emerald-400';
      case 3: return 'bg-blue-800 text-blue-100 border-blue-400';
      case 4: return 'bg-purple-800 text-purple-100 border-purple-400';
      case 5: return 'bg-amber-700 text-amber-100 border-amber-400';
      case 6: return 'bg-red-800 text-red-100 border-red-400';
      case 7: return 'bg-yellow-600 text-slate-950 font-black border-yellow-300';
      default: return 'bg-slate-800 text-slate-200 border-slate-400';
    }
  };

  const realImgSrc = REAL_TROOP_IMAGES[id];

  // High-fidelity illustrated vector graphics matching the game screenshots
  const renderVisual = () => {
    switch (id) {
      // 1. ARQUEIRO (Gladiator Archer with red sash, drawn bow)
      case 'g1_ranged':
      case 'g2_ranged':
      case 'g3_ranged':
      case 'g4_ranged':
      case 'g5_ranged':
      case 'archer':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_archer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a6042" />
                <stop offset="100%" stopColor="#1e2c1a" />
              </linearGradient>
              <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d49b6a" />
                <stop offset="100%" stopColor="#a3693e" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_archer)" />
            <path d="M 20 50 Q 10 75 18 100 L 82 100 Q 90 75 80 50 Z" fill="#881a1a" />
            <path d="M 32 55 Q 50 50 68 55 L 72 100 L 28 100 Z" fill="url(#skin)" />
            <path d="M 33 58 L 67 78 L 64 84 L 30 64 Z" fill="#42220f" />
            <path d="M 67 58 L 33 78 L 36 84 L 70 64 Z" fill="#42220f" />
            <circle cx="50" cy="71" r="5" fill="#caa568" stroke="#331c0a" strokeWidth="1.5" />
            <path d="M 44 42 L 56 42 L 56 52 L 44 52 Z" fill="url(#skin)" />
            <ellipse cx="50" cy="36" rx="13" ry="15" fill="url(#skin)" />
            <path d="M 37 32 Q 50 18 63 32 Q 58 24 50 24 Q 42 24 37 32 Z" fill="#18181b" />
            <ellipse cx="44" cy="22" rx="4" ry="5" fill="#18181b" />
            <path d="M 43 20 L 40 14" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 43 36 L 47 37 M 53 37 L 57 36" stroke="#2c1a0e" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="46" cy="39" rx="1.5" ry="1" fill="#18181b" />
            <ellipse cx="54" cy="39" rx="1.5" ry="1" fill="#18181b" />
            <path d="M 47 45 Q 50 48 53 45" stroke="#4a2612" strokeWidth="1.5" fill="none" />
            <path d="M 82 10 Q 95 50 78 92" stroke="#603813" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 82 10 L 40 46 L 78 92" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,1" fill="none" />
            <path d="M 32 48 L 92 42" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="95,41 90,38 91,44" fill="#64748b" />
            <path d="M 30 54 Q 18 50 28 42 L 40 46 Z" fill="url(#skin)" stroke="#5c341b" strokeWidth="1" />
            <rect x="23" y="44" width="8" height="7" rx="2" fill="#42220f" transform="rotate(-15 25 45)" />
          </svg>
        );

      // 2. GUERREIRO / ESPADACHIM (Gladiator with Mohawk, Red cape, Spear)
      case 'g1_melee':
      case 'g2_melee':
      case 'g3_melee':
      case 'g4_melee':
      case 'g5_melee':
      case 'warrior':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_warrior" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#556b2f" />
                <stop offset="100%" stopColor="#1e2710" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_warrior)" />
            <line x1="22" y1="5" x2="22" y2="95" stroke="#5c3c1e" strokeWidth="3.5" />
            <polygon points="22,2 18,16 26,16" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <path d="M 26 40 Q 15 70 20 100 L 85 100 Q 92 70 78 40 Z" fill="#991b1b" />
            <path d="M 35 50 Q 50 48 65 50 L 68 85 L 32 85 Z" fill="#92400e" stroke="#78350f" strokeWidth="1" />
            <path d="M 40 55 Q 50 62 60 55" stroke="#f59e0b" strokeWidth="2" fill="none" />
            <rect x="34" y="80" width="32" height="18" fill="#451a03" />
            <path d="M 36 84 L 38 100 M 44 84 L 45 100 M 52 84 L 52 100 M 60 84 L 59 100" stroke="#78350f" strokeWidth="3" />
            <path d="M 44 38 L 56 38 L 56 48 L 44 48 Z" fill="#d49b6a" />
            <ellipse cx="50" cy="33" rx="11" ry="13" fill="#d49b6a" />
            <path d="M 42 35 Q 50 48 58 35 Q 50 43 42 35 Z" fill="#27272a" />
            <path d="M 48 18 Q 50 14 52 18 L 52 30 L 48 30 Z" fill="#27272a" />
            <circle cx="46" cy="31" r="1.5" fill="#18181b" />
            <circle cx="54" cy="31" r="1.5" fill="#18181b" />
            <circle cx="72" cy="50" r="7" fill="#b45309" stroke="#fbbf24" strokeWidth="1" />
          </svg>
        );

      // 3. CAVALEIRO / CAVALARIA (Desert Rider with Red Turban on Horse)
      case 'g1_mounted':
      case 'g2_mounted':
      case 'g3_mounted':
      case 'g4_mounted':
      case 'g5_mounted':
      case 'horseman':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_horse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#415a4e" />
                <stop offset="100%" stopColor="#1a2520" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_horse)" />
            <ellipse cx="38" cy="85" rx="26" ry="20" fill="#542e14" />
            <path d="M 20 80 Q 28 55 42 58 L 48 78 Z" fill="#6d3917" />
            <ellipse cx="22" cy="62" rx="8" ry="12" fill="#542e14" transform="rotate(-25 22 62)" />
            <path d="M 32 50 Q 38 65 38 75" stroke="#1c1917" strokeWidth="4" fill="none" />
            <path d="M 18 58 L 26 65 M 24 55 L 20 72" stroke="#caa568" strokeWidth="1.5" />
            <path d="M 45 42 Q 35 60 40 95 L 85 95 Q 85 60 75 42 Z" fill="#881a1a" />
            <path d="M 52 48 L 74 48 L 76 80 L 50 80 Z" fill="#292524" stroke="#78350f" strokeWidth="1" />
            <circle cx="63" cy="62" r="5" fill="#f59e0b" />
            <ellipse cx="62" cy="32" rx="10" ry="11" fill="#c28854" />
            <path d="M 52 28 Q 62 18 72 28 Q 74 34 70 36 L 54 36 Z" fill="#991b1b" />
            <circle cx="62" cy="26" r="2.5" fill="#fbbf24" />
            <path d="M 57 37 Q 62 40 67 37" stroke="#1c1917" strokeWidth="2" fill="none" />
            <ellipse cx="80" cy="65" rx="12" ry="16" fill="#78350f" stroke="#caa568" strokeWidth="2" />
            <circle cx="80" cy="65" r="4" fill="#fbbf24" />
          </svg>
        );

      // 4. GRIFO DE BATALHA (Tier V Flying War Griffin)
      case 'g5_flying':
      case 'griffin':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_griffin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#270e06" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_griffin)" />
            <path d="M 20 85 Q 15 30 35 25 Q 40 45 48 60 Z" fill="#78350f" stroke="#b45309" strokeWidth="1" />
            <circle cx="60" cy="42" r="18" fill="#d97706" />
            <path d="M 68 28 Q 80 32 76 44 L 62 44 Z" fill="#b45309" />
            <path d="M 70 38 Q 92 40 88 52 Q 78 50 72 46 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <circle cx="68" cy="38" r="3" fill="#dc2626" />
            <circle cx="68" cy="38" r="1.5" fill="#fef08a" />
            <path d="M 45 60 Q 65 55 78 68 L 72 95 L 42 95 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 52 68 Q 62 75 70 68" stroke="#fbbf24" strokeWidth="2" fill="none" />
          </svg>
        );

      // 5. BESTEIRO PESADO (Tier VI Heavy Crossbow with Blue Tabard & Cross Shield)
      case 'g6_ranged':
      case 'heavy_crossbow':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_cross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_cross)" />
            <path d="M 22 45 Q 15 70 20 100 L 80 100 Q 85 70 78 45 Z" fill="#1d4ed8" />
            <ellipse cx="48" cy="36" rx="13" ry="12" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
            <path d="M 36 38 L 60 38 L 58 44 L 38 44 Z" fill="#1e293b" />
            <path d="M 55 50 L 86 48 L 82 98 L 52 96 Z" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="2" />
            <path d="M 68 54 L 68 90 M 58 68 L 78 68" stroke="#ca8a04" strokeWidth="4" />
            <rect x="25" y="48" width="40" height="6" rx="2" fill="#451a03" transform="rotate(-15 35 50)" />
            <path d="M 20 38 Q 45 42 62 30" stroke="#475569" strokeWidth="3" fill="none" />
          </svg>
        );

      // 6. ALABARDEIRO PESADO (Tier VI Heavy Halberdier in Full Plate)
      case 'g6_melee':
      case 'heavy_halberd':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_halberd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_halberd)" />
            <line x1="20" y1="2" x2="70" y2="98" stroke="#451a03" strokeWidth="3" />
            <polygon points="18,5 12,18 24,14" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <path d="M 12 12 Q 5 8 8 20 L 16 16 Z" fill="#94a3b8" />
            <path d="M 30 40 Q 20 70 25 100 L 80 100 Q 88 70 80 40 Z" fill="#1e40af" />
            <path d="M 40 45 L 70 45 L 72 85 L 38 85 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
            <rect x="48" y="48" width="14" height="36" fill="#1d4ed8" />
            <path d="M 55 52 L 55 78 M 50 62 L 60 62" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M 32 50 L 42 68 M 68 50 L 58 68" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
            <ellipse cx="55" cy="30" rx="10" ry="11" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            <rect x="48" y="28" width="14" height="3" fill="#0f172a" />
          </svg>
        );

      // 7. CAVALEIRO MONTADO (Tier VI Mounted Plate Knight with Lance)
      case 'g6_mounted':
      case 'knight':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_knight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_knight)" />
            <ellipse cx="40" cy="85" rx="28" ry="18" fill="#451a03" />
            <path d="M 22 80 Q 40 75 60 82 L 58 98 L 24 98 Z" fill="#1e40af" />
            <path d="M 30 80 L 45 98 M 45 80 L 30 98" stroke="#ffffff" strokeWidth="2" />
            <ellipse cx="56" cy="36" rx="11" ry="12" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
            <path d="M 54 24 Q 60 16 66 22 L 60 26 Z" fill="#f8fafc" />
            <line x1="12" y1="52" x2="90" y2="48" stroke="#60a5fa" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 25 51 L 35 49 M 50 50 L 60 48 M 75 49 L 85 47" stroke="#ffffff" strokeWidth="3" />
            <polygon points="56,52 74,48 70,72 56,66" fill="#1d4ed8" stroke="#ca8a04" strokeWidth="1.5" />
            <path d="M 64 52 L 64 68 M 58 60 L 70 60" stroke="#facc15" strokeWidth="2" />
          </svg>
        );

      // 8. PURIFICADOR (Tier I/II G7 Musketeer with Gun & Bandolier)
      case 'g7_ranged':
      case 'purifier':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_purifier" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_purifier)" />
            <ellipse cx="50" cy="32" rx="12" ry="10" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
            <path d="M 36 34 Q 50 20 64 34 Q 68 36 60 36 L 40 36 Z" fill="#94a3b8" />
            <ellipse cx="50" cy="40" rx="9" ry="9" fill="#d49b6a" />
            <path d="M 43 43 Q 50 48 57 43" stroke="#262626" strokeWidth="2.5" fill="none" />
            <path d="M 32 50 L 68 50 L 72 95 L 28 95 Z" fill="#701a75" stroke="#4a044e" strokeWidth="1" />
            <path d="M 38 52 L 62 52 L 60 76 L 40 76 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <line x1="34" y1="52" x2="65" y2="88" stroke="#451a03" strokeWidth="3.5" />
            <rect x="40" y="60" width="3" height="6" fill="#ca8a04" />
            <rect x="46" y="67" width="3" height="6" fill="#ca8a04" />
            <rect x="52" y="74" width="3" height="6" fill="#ca8a04" />
            <rect x="18" y="52" width="70" height="6" rx="2" fill="#451a03" transform="rotate(-8 45 55)" />
            <line x1="60" y1="46" x2="88" y2="42" stroke="#94a3b8" strokeWidth="3" />
          </svg>
        );

      // 9. JUSTICEIRO (Tier I/II G7 Heavy Greatsword Guard with Skull plate)
      case 'g7_melee':
      case 'justiciar':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_justiciar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="100%" stopColor="#1f020a" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_justiciar)" />
            <ellipse cx="50" cy="32" rx="12" ry="10" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
            <path d="M 52 22 Q 62 10 56 6" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="50" cy="38" rx="10" ry="10" fill="#d49b6a" />
            <path d="M 42 38 Q 50 48 58 38 Q 50 44 42 38 Z" fill="#262626" />
            <circle cx="28" cy="60" r="11" fill="#881337" stroke="#4c0519" strokeWidth="1" />
            <circle cx="72" cy="60" r="11" fill="#881337" stroke="#4c0519" strokeWidth="1" />
            <path d="M 36 50 L 64 50 L 62 90 L 38 90 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            <circle cx="34" cy="54" r="5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
            <line x1="16" y1="92" x2="78" y2="40" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="68" y1="36" x2="76" y2="46" stroke="#ca8a04" strokeWidth="3" />
          </svg>
        );

      // 10. TRITURADOR (Tier I/II G7 Cavalier with Tricorne & Pistol)
      case 'g7_mounted':
      case 'crusher':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_crusher" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e1065" />
                <stop offset="100%" stopColor="#0f0522" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_crusher)" />
            <ellipse cx="38" cy="85" rx="24" ry="16" fill="#2e1065" stroke="#ca8a04" strokeWidth="1" />
            <polygon points="50,18 30,30 70,30" fill="#18181b" stroke="#71717a" strokeWidth="1" />
            <ellipse cx="50" cy="35" rx="9" ry="10" fill="#d49b6a" />
            <path d="M 46 41 Q 50 48 54 41 Z" fill="#18181b" />
            <path d="M 44 45 Q 50 48 56 45" stroke="#ffffff" strokeWidth="3" fill="none" />
            <path d="M 35 50 L 65 50 L 62 85 L 38 85 Z" fill="#581c87" stroke="#3b0764" strokeWidth="1" />
            <line x1="55" y1="58" x2="88" y2="35" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="72" y1="45" x2="88" y2="35" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 11. CORVO (Tier I/II G7 Raven Rider)
      case 'g7_flying':
      case 'raven':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_raven" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_raven)" />
            <ellipse cx="58" cy="72" rx="26" ry="22" fill="#0f172a" />
            <path d="M 68 62 Q 95 72 90 84 Q 75 80 65 76 Z" fill="#020617" stroke="#334155" strokeWidth="1.5" />
            <circle cx="68" cy="66" r="3" fill="#38bdf8" />
            <circle cx="68" cy="66" r="1" fill="#ffffff" />
            <ellipse cx="44" cy="38" rx="8" ry="9" fill="#d49b6a" />
            <ellipse cx="43" cy="30" rx="9" ry="5" fill="#1d4ed8" />
            <path d="M 34 46 L 56 46 L 54 68 L 36 68 Z" fill="#4c0519" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        );

      // 12. BRUNHILD (Captain Nv 25)
      case 'brunhild':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_brunhild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7f1d1d" />
                <stop offset="100%" stopColor="#2a0808" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_brunhild)" />
            <path d="M 28 35 Q 20 65 24 95 L 76 95 Q 80 65 72 35 Z" fill="#b91c1c" />
            <ellipse cx="50" cy="42" rx="14" ry="16" fill="#fcd34d" />
            <path d="M 38 32 Q 50 20 62 32 Q 56 26 50 26 Q 44 26 38 32 Z" fill="#b91c1c" />
            <path d="M 38 30 L 44 22 L 50 28 L 56 22 L 62 30 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            <circle cx="44" cy="42" r="1.5" fill="#18181b" />
            <circle cx="56" cy="42" r="1.5" fill="#18181b" />
            <path d="M 46 50 Q 50 53 54 50" stroke="#dc2626" strokeWidth="2" fill="none" />
            <path d="M 30 65 L 70 65 L 68 100 L 32 100 Z" fill="#991b1b" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="28" cy="65" r="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <circle cx="72" cy="65" r="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          </svg>
        );

      // 13. AYDAE (Captain Nv 23)
      case 'aydae':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_aydae" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#134e4a" />
                <stop offset="100%" stopColor="#042f2e" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_aydae)" />
            <ellipse cx="50" cy="22" rx="8" ry="7" fill="#0f172a" />
            <line x1="38" y1="20" x2="62" y2="24" stroke="#dc2626" strokeWidth="2" />
            <ellipse cx="50" cy="42" rx="13" ry="15" fill="#fed7aa" />
            <path d="M 38 34 Q 50 28 62 34 L 62 45 Q 50 38 38 45 Z" fill="#0f172a" />
            <path d="M 43 41 Q 46 43 48 41 M 52 41 Q 54 43 57 41" stroke="#0f172a" strokeWidth="1.5" fill="none" />
            <path d="M 32 62 L 68 62 L 66 100 L 34 100 Z" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
            <path d="M 44 62 L 50 72 L 56 62" fill="#dc2626" />
          </svg>
        );

      // 14. LEÔNIDAS (Captain Nv 23)
      case 'leonidas':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_leo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_leo)" />
            <path d="M 50 5 Q 52 2 54 5 L 54 30 L 46 30 Z" fill="#b91c1c" />
            <path d="M 35 15 Q 50 8 65 15 L 60 22 Q 50 16 40 22 Z" fill="#dc2626" />
            <path d="M 34 32 Q 50 20 66 32 L 66 56 Q 50 52 50 68 Q 50 52 34 56 Z" fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
            <rect x="42" y="38" width="6" height="4" rx="1" fill="#0c0a09" />
            <rect x="52" y="38" width="6" height="4" rx="1" fill="#0c0a09" />
            <line x1="50" y1="36" x2="50" y2="52" stroke="#0c0a09" strokeWidth="3" />
            <path d="M 28 65 L 72 65 L 76 100 L 24 100 Z" fill="#991b1b" />
          </svg>
        );

      // 15. TITÃ DE FOGO (M5 Mercenary)
      case 'm5_titan':
      case 'titan':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_titan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_titan)" />
            <circle cx="50" cy="46" r="22" fill="#1c1917" stroke="#ea580c" strokeWidth="2.5" />
            <path d="M 30 35 Q 18 15 28 8 Q 34 22 36 32 Z" fill="#f97316" />
            <path d="M 70 35 Q 82 15 72 8 Q 66 22 64 32 Z" fill="#f97316" />
            <circle cx="42" cy="42" r="3.5" fill="#facc15" />
            <circle cx="58" cy="42" r="3.5" fill="#facc15" />
            <path d="M 40 54 Q 50 62 60 54" stroke="#f97316" strokeWidth="3" fill="none" />
            <path d="M 50 32 L 50 38 M 38 48 L 44 50 M 62 48 L 56 50" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M 24 70 L 76 70 L 80 100 L 20 100 Z" fill="#292524" stroke="#dc2626" strokeWidth="2" />
          </svg>
        );

      // 16. DRAGÃO
      case 'dragon':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_dragon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_dragon)" />
            <path d="M 25 50 Q 55 20 78 35 Q 85 52 70 65 L 35 70 Z" fill="#991b1b" stroke="#f97316" strokeWidth="2" />
            <path d="M 40 32 Q 35 8 20 5 Q 30 18 35 30 Z" fill="#451a03" />
            <path d="M 55 26 Q 58 5 45 2 Q 50 15 50 25 Z" fill="#451a03" />
            <circle cx="62" cy="40" r="4" fill="#fbbf24" />
            <polygon points="62,38 64,40 62,42 60,40" fill="#000000" />
            <circle cx="82" cy="52" r="3" fill="#f97316" />
          </svg>
        );

      // 17. MAGOGUE (Target Monster)
      case 'magogue_inferno':
      case 'inferno_squad':
      case 'magogue':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bg_magogue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#1c0505" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg_magogue)" />
            <path d="M 28 45 Q 50 35 72 45 L 75 100 L 25 100 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
            <circle cx="50" cy="38" r="16" fill="#991b1b" />
            <path d="M 36 32 Q 20 18 25 8 Q 38 12 40 28 Z" fill="#1c1917" stroke="#451a03" strokeWidth="1" />
            <path d="M 64 32 Q 80 18 75 8 Q 62 12 60 28 Z" fill="#1c1917" stroke="#451a03" strokeWidth="1" />
            <polygon points="40,36 46,38 42,42" fill="#fef08a" />
            <polygon points="60,36 54,38 58,42" fill="#fef08a" />
            <path d="M 40 48 Q 50 56 60 48 Q 50 52 40 48 Z" fill="#18181b" />
            <polygon points="44,48 46,51 48,48" fill="#ffffff" />
            <polygon points="52,48 54,51 56,48" fill="#ffffff" />
          </svg>
        );

      // Default Fallback
      default:
        return (
          <div className="w-full h-full bg-[#182030] flex flex-col items-center justify-center font-bold text-slate-400 text-xs">
            <span className="text-lg">🛡️</span>
          </div>
        );
    }
  };

  const romanTier = getTierRoman(tier);

  return (
    <div
      className={`relative ${sizeClasses} rounded-xl border-2 border-[#caa568] bg-[#1a2333] shadow-md flex-shrink-0 overflow-hidden ring-1 ring-black/40 ${className}`}
    >
      {realImgSrc && !imgError ? (
        <img
          src={realImgSrc}
          alt={id}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        renderVisual()
      )}

      {/* Roman Tier Badge in Top Left Corner matching Total Battle Quartel cards */}
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

