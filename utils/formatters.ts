/**
 * Formats a number into a short readable string.
 * e.g. 1200 → "1.2K", 1500000 → "1.5M"
 */
export const formatCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000)     return `${(count / 1_000).toFixed(1)}K`;
  return count?.toString() ?? '0';
};

/**
 * Returns a deterministic color from a preset palette based on the first character.
 */
const AVATAR_COLORS = ['#E91E8C', '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C', '#E74C3C'];

export const getAvatarColor = (name: string): string => {
  const index = (name?.codePointAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};
