import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { REAL_TROOP_IMAGES } from '../data/troopAvatarPaths';

interface TroopAvatarProps {
  id: string;
  avatarPath?: string;
  databaseOnly?: boolean;
  tier?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  levelBadge?: number | string;
  className?: string;
}

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
  avatarPath,
  databaseOnly = false,
  size = 'md',
  levelBadge,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const realImgSrc = avatarPath || (databaseOnly ? '' : getTroopImageSrc(id));

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
