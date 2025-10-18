'use client';

type Challenge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: number;
};

export function DailyChallenges({ todayTrades, totalTrades }: { todayTrades: any[]; totalTrades: number }) {
  const challenges: Challenge[] = [];

  // Challenge 1: Post trades today
  const tradesPosted = todayTrades.length;
  challenges.push({
    id: 'daily_trades',
    name: 'Active Trader',
    description: 'Post 3 trades today',
    emoji: '📊',
    progress: tradesPosted,
    target: 3,
    completed: tradesPosted >= 3,
    reward: 50
  });

  // Challenge 2: Win rate today
  const todayWins = todayTrades.filter(t => t.pnl > 0).length;
  const todayWinRate = todayTrades.length > 0 ? (todayWins / todayTrades.length) * 100 : 0;
  challenges.push({
    id: 'win_rate',
    name: 'Winning Streak',
    description: 'Achieve 60% win rate today (min 3 trades)',
    emoji: '🎯',
    progress: Math.min(todayWinRate, 60),
    target: 60,
    completed: todayWinRate >= 60 && todayTrades.length >= 3,
    reward: 100
  });

  // Challenge 3: Profitable day
  const todayPnl = todayTrades.reduce((sum, t) => sum + t.pnl, 0);
  challenges.push({
    id: 'profitable_day',
    name: 'Green Day',
    description: 'End the day profitable',
    emoji: '💰',
    progress: Math.max(todayPnl, 0),
    target: 100,
    completed: todayPnl > 0,
    reward: 75
  });

  // Challenge 4: Big trade
  const hasBigTrade = todayTrades.some(t => t.positionSize >= 5000);
  challenges.push({
    id: 'big_trade',
    name: 'Go Big',
    description: 'Trade with $5,000+ position',
    emoji: '🐋',
    progress: hasBigTrade ? 1 : 0,
    target: 1,
    completed: hasBigTrade,
    reward: 150
  });

  const completedCount = challenges.filter(c => c.completed).length;
  const totalRewards = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🎯 Daily Challenges</h3>
        <div className="text-sm text-gray-400">
          {completedCount}/{challenges.length} completed
        </div>
      </div>

      {todayTrades.length === 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
          <p className="text-blue-400 text-sm">
            💡 Post your first trade today to start completing challenges!
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id}
            className={`p-4 rounded-lg border transition-all ${
              challenge.completed 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{challenge.emoji}</span>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {challenge.name}
                    {challenge.completed && <span className="text-green-400">✓</span>}
                  </div>
                  <div className="text-sm text-gray-400">{challenge.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Reward</div>
                <div className="text-sm font-bold text-yellow-400">+{challenge.reward} XP</div>
              </div>
            </div>

            {!challenge.completed && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.min(challenge.progress, challenge.target)}/{challenge.target}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {completedCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-yellow-400">🎉 Great Job!</div>
              <div className="text-sm text-gray-300">You've earned {totalRewards} XP today</div>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        Challenges reset daily at midnight UTC
      </div>
    </div>
  );
}