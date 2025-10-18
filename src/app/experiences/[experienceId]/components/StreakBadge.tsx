'use client';

type StreakBadgeProps = {
  streak: number;
  type: 'win' | 'loss';
  size?: 'sm' | 'md' | 'lg';
};

export function StreakBadge({ streak, type, size = 'md' }: StreakBadgeProps) {
  if (streak < 3) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const getStreakDisplay = () => {
    if (type === 'win') {
      if (streak >= 10) return { emoji: '🚀', text: 'LEGENDARY', color: 'from-yellow-400 to-orange-500' };
      if (streak >= 7) return { emoji: '💥', text: 'ON FIRE', color: 'from-orange-400 to-red-500' };
      if (streak >= 5) return { emoji: '🔥', text: 'HOT', color: 'from-red-400 to-orange-400' };
      return { emoji: '🔥', text: `${streak} WIN`, color: 'from-green-400 to-green-600' };
    } else {
      if (streak >= 7) return { emoji: '💀', text: 'CURSED', color: 'from-gray-600 to-gray-800' };
      if (streak >= 5) return { emoji: '❄️', text: 'FROZEN', color: 'from-blue-400 to-blue-600' };
      return { emoji: '❄️', text: `${streak} LOSS`, color: 'from-blue-300 to-blue-500' };
    }
  };

  const display = getStreakDisplay();

  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${display.color} font-bold ${sizeClasses[size]} animate-pulse`}>
      <span>{display.emoji}</span>
      <span className="text-white">{display.text}</span>
    </div>
  );
}