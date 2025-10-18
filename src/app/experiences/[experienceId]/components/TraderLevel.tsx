'use client';

type Level = {
  id: number;
  name: string;
  minTrades: number;
  emoji: string;
  color: string;
};

const LEVELS: Level[] = [
  { id: 1, name: 'Rookie', minTrades: 0, emoji: '🌱', color: 'from-gray-400 to-gray-600' },
  { id: 2, name: 'Trader', minTrades: 10, emoji: '📊', color: 'from-blue-400 to-blue-600' },
  { id: 3, name: 'Pro', minTrades: 50, emoji: '⚡', color: 'from-purple-400 to-purple-600' },
  { id: 4, name: 'Expert', minTrades: 100, emoji: '🔥', color: 'from-orange-400 to-red-500' },
  { id: 5, name: 'Master', minTrades: 200, emoji: '💎', color: 'from-cyan-400 to-blue-500' },
  { id: 6, name: 'Legend', minTrades: 500, emoji: '👑', color: 'from-yellow-400 to-yellow-600' },
];

function getCurrentLevel(totalTrades: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalTrades >= LEVELS[i].minTrades) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

function getNextLevel(currentLevel: Level): Level | null {
  const currentIndex = LEVELS.findIndex(l => l.id === currentLevel.id);
  if (currentIndex < LEVELS.length - 1) {
    return LEVELS[currentIndex + 1];
  }
  return null;
}

export function TraderLevel({ totalTrades, totalPnl }: { totalTrades: number; totalPnl: number }) {
  const currentLevel = getCurrentLevel(totalTrades);
  const nextLevel = getNextLevel(currentLevel);
  
  const tradesUntilNext = nextLevel ? nextLevel.minTrades - totalTrades : 0;
  const progress = nextLevel 
    ? ((totalTrades - currentLevel.minTrades) / (nextLevel.minTrades - currentLevel.minTrades)) * 100
    : 100;

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-4">🎖️ Trader Level</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentLevel.color} flex items-center justify-center text-4xl shadow-lg`}>
          {currentLevel.emoji}
        </div>
        
        <div>
          <div className="text-3xl font-bold">Level {currentLevel.id}</div>
          <div className={`text-xl bg-gradient-to-r ${currentLevel.color} bg-clip-text text-transparent font-bold`}>
            {currentLevel.name}
          </div>
        </div>
      </div>

      {nextLevel ? (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>{totalTrades} trades</span>
              <span>{nextLevel.minTrades} trades to {nextLevel.name}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 bg-gradient-to-r ${currentLevel.color} transition-all duration-500`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-3">
            {tradesUntilNext} more trade{tradesUntilNext !== 1 ? 's' : ''} to reach {nextLevel.emoji} {nextLevel.name}!
          </p>
        </>
      ) : (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
          <p className="text-yellow-400 font-bold text-center">
            🏆 MAX LEVEL REACHED! 🏆
          </p>
          <p className="text-sm text-gray-300 text-center mt-1">
            You're a trading legend!
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Performance</span>
          <span className={`font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}