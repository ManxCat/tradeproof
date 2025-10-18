'use client';

type Achievement = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Posted your first trade', emoji: '🎯', color: 'from-blue-400 to-blue-600' },
  { id: 'hot_streak', name: 'Hot Streak', description: '3+ winning trades in a row', emoji: '🔥', color: 'from-orange-400 to-red-500' },
  { id: 'whale', name: 'Whale', description: 'Trade over $10,000', emoji: '🐋', color: 'from-cyan-400 to-blue-500' },
  { id: 'profitable', name: 'Profitable', description: 'Positive total P&L', emoji: '💰', color: 'from-green-400 to-green-600' },
  { id: 'century_club', name: 'Century Club', description: '100+ total trades', emoji: '💯', color: 'from-purple-400 to-pink-500' },
  { id: 'perfect_week', name: 'Perfect Week', description: '100% win rate (5+ trades)', emoji: '⭐', color: 'from-yellow-400 to-orange-500' },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Recovered from 3+ loss streak', emoji: '🦸', color: 'from-indigo-400 to-purple-500' },
  { id: 'diamond_hands', name: 'Diamond Hands', description: '10+ consecutive trades', emoji: '💎', color: 'from-gray-300 to-gray-400' },
];

export function AchievementBadge({ achievementId, size = 'md' }: { achievementId: string; size?: 'sm' | 'md' | 'lg' }) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer`}
      title={`${achievement.name}: ${achievement.description}`}
    >
      {achievement.emoji}
    </div>
  );
}

export function AchievementsList({ achievements }: { achievements: string[] }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-4">🏆 Achievements</h3>
      
      {achievements.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No achievements yet. Keep trading!</p>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {achievements.map((achievementId) => (
            <div key={achievementId} className="flex flex-col items-center gap-2">
              <AchievementBadge achievementId={achievementId} size="lg" />
              <span className="text-xs text-gray-400 text-center">
                {ACHIEVEMENTS.find(a => a.id === achievementId)?.name}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-500">
          {achievements.length} / {ACHIEVEMENTS.length} achievements unlocked
        </p>
        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(achievements.length / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function calculateAchievements(trades: any[]): string[] {
  const achievements: string[] = [];
  
  if (trades.length > 0) achievements.push('first_blood');
  
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  if (totalPnl > 0) achievements.push('profitable');
  
  if (trades.length >= 100) achievements.push('century_club');
  
  if (trades.some(t => t.positionSize >= 10000)) achievements.push('whale');
  
  let maxWinStreak = 0;
  let currentStreak = 0;
  for (const trade of trades) {
    if (trade.pnl > 0) {
      currentStreak++;
      maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  if (maxWinStreak >= 3) achievements.push('hot_streak');
  
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  if (trades.length >= 5 && winningTrades === trades.length) achievements.push('perfect_week');
  
  let maxConsecutive = 0;
  currentStreak = 0;
  let hadLossStreak = false;
  for (const trade of trades) {
    currentStreak++;
    if (trade.pnl < 0 && currentStreak >= 3) hadLossStreak = true;
    maxConsecutive = Math.max(maxConsecutive, currentStreak);
  }
  if (hadLossStreak && maxWinStreak >= 3) achievements.push('comeback_kid');
  
  if (maxConsecutive >= 10) achievements.push('diamond_hands');
  
  return achievements;
}