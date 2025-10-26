'use client';

export function Competition({ allTrades, experienceId }: { allTrades: any[]; experienceId: string }) {
  // Calculate week dates
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  // Filter trades for this week
  const weekTrades = allTrades.filter(trade => {
    const tradeDate = new Date(trade.createdAt);
    return tradeDate >= monday && tradeDate <= sunday;
  });

  // Calculate stats per trader
  const statsMap = new Map();
  
  weekTrades.forEach((trade) => {
    if (!statsMap.has(trade.userId)) {
      statsMap.set(trade.userId, {
        userId: trade.userId,
        pnl: 0,
        trades: 0,
        wins: 0,
      });
    }
    
    const stats = statsMap.get(trade.userId);
    const tradePnl = parseFloat(trade.pnl);  // PARSE TO NUMBER!
    stats.pnl += tradePnl;
    stats.trades += 1;
    if (tradePnl > 0) stats.wins += 1;
  });

  // Create leaderboard
  const leaders = Array.from(statsMap.values())
    .map((s: any) => ({
      userId: s.userId,
      pnl: s.pnl,
      trades: s.trades,
      winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  const daysLeft = Math.ceil((sunday.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🏆 Weekly Competition</h2>
          <p className="text-sm text-gray-400">
            {monday.toLocaleDateString()} - {sunday.toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Ends in</div>
          <div className="text-2xl font-bold text-yellow-400">{daysLeft} days</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-lg text-center">
          <div className="text-3xl mb-1">🥇</div>
          <div className="text-sm text-white/80">#1 Prize</div>
          <div className="text-xl font-bold text-white">$500</div>
        </div>
        <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-4 rounded-lg text-center">
          <div className="text-3xl mb-1">🥈</div>
          <div className="text-sm text-white/80">#2 Prize</div>
          <div className="text-xl font-bold text-white">$300</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-lg text-center">
          <div className="text-3xl mb-1">🥉</div>
          <div className="text-sm text-white/80">#3 Prize</div>
          <div className="text-xl font-bold text-white">$100</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-bold mb-4 flex items-center justify-between">
          <span>Current Rankings</span>
          <span className="text-sm text-gray-400">{leaders.length} participants</span>
        </h3>

        {leaders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-gray-400">No entries yet. Be the first to compete!</p>
            <p className="text-sm text-gray-500 mt-2">Post trades this week to enter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              const medals = ['🥇', '🥈', '🥉'];
              const colors = [
                'from-yellow-400 to-yellow-600',
                'from-gray-300 to-gray-400',
                'from-orange-400 to-orange-500'
              ];
              const isPrize = rank <= 3;
              const bgClass = isPrize ? `bg-gradient-to-r ${colors[rank - 1]}` : 'bg-gray-700 hover:bg-gray-600';
              
              return (
                <div
                  key={entry.userId}
                  onClick={() => window.location.href = `/experiences/${experienceId}/trader/${entry.userId}`}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.02] cursor-pointer ${bgClass}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold w-8 text-center">
                      {isPrize ? medals[rank - 1] : `#${rank}`}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        Trader #{entry.userId.slice(-6)}
                      </div>
                      <div className="text-xs text-white/70">
                        {entry.trades} trades • {entry.winRate.toFixed(0)}% win rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      entry.pnl >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      ${entry.pnl >= 0 ? '+' : ''}{entry.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>💡</span>
          <span>Top 3 traders win prizes! Competition resets every Monday.</span>
        </div>
      </div>
    </div>
  );
}