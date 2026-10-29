import type { ReactNode } from 'react';
import { motion } from 'motion/react';

type AvatarSize = 'sm' | 'md' | 'lg';

interface MaterialAvatarProps {
  name: string;
  badge?: ReactNode;
  imageSrc?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-12 w-12 text-sm',
  md: 'h-16 w-16 text-base',
  lg: 'h-20 w-20 text-xl',
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'PI';

export const MaterialAvatar = ({
  name,
  badge,
  imageSrc,
  size = 'md',
  className,
}: MaterialAvatarProps) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={['material-avatar', sizeClasses[size], className].filter(Boolean).join(' ')}
    >
      <div className="material-avatar__halo" />
      <div className="material-avatar__core">
        {imageSrc ? (
          <img src={imageSrc} alt={`${name} avatar`} className="h-2/3 w-2/3 object-contain" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {badge ? <div className="material-avatar__badge">{badge}</div> : null}
    </motion.div>
  );
};
