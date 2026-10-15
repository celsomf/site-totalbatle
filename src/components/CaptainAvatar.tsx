import React, { useState } from 'react';
import { Captain } from '../types';

interface CaptainAvatarProps {
  captain: Captain;
  className?: string;
}

export const CaptainAvatar: React.FC<CaptainAvatarProps> = ({ captain, className = '' }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const initial = captain.name.trim().charAt(0).toUpperCase() || '?';
  const fallback = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#172033"/><text x="64" y="82" text-anchor="middle" font-family="Arial,sans-serif" font-size="64" font-weight="700" fill="#fbbf24">${initial}</text></svg>`
  )}`;

  return (
    <img
      src={hasImageError ? fallback : captain.avatarIcon}
      alt={captain.name}
      className={className}
      onError={() => setHasImageError(true)}
    />
  );
};
