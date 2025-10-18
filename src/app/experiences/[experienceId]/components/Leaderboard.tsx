'use client';

type LeaderboardEntry = {
  userId: string;
  totalPnl: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  rank: number;
};

export function Leaderboard({ data, experienceId }: { data: LeaderboardEntry[]; experienceId: string }) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6">🏆 Top Traders</h2>
        <p className="text-gray-400 text-center py-8">No traders yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-3xl font-bold mb-6">🏆 Top Traders</h2>
      
      <div className="space-y-3">
        {data.map((trader) => {
          const medal = trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : '#' + trader.rank;
          const url = '/experiences/' + experienceId + '/trader/' + trader.userId;
          
          return (
            <a key={trader.userId} href={url} className="block">
              {trader.rank === 1 && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold w-12 text-center">{medal}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Trader #{trader.userId.slice(-6)}</h3>
                        <div className="flex gap-4 text-sm text-gray-200">
                          <span>{trader.totalTrades} trades</span>
                          <span>•</span>
                          <span>{trader.winRate.toFixed(1)}% win rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={trader.totalPnl >= 0 ? 'text-3xl font-bold text-green-400' : 'text-3xl font-bold text-red-400'}>
                        ${trader.totalPnl >= 0 ? '+' : ''}{trader.totalPnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-200">{trader.winningTrades}W / {trader.totalTrades - trader.winningTrades}L</div>
                    </div>
                  </div>
                </div>
              )}
              {trader.rank === 2 && (
                <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold w-12 text-center">{medal}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Trader #{trader.userId.slice(-6)}</h3>
                        <div className="flex gap-4 text-sm text-gray-200">
                          <span>{trader.totalTrades} trades</span>
                          <span>•</span>
                          <span>{trader.winRate.toFixed(1)}% win rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={trader.totalPnl >= 0 ? 'text-3xl font-bold text-green-400' : 'text-3xl font-bold text-red-400'}>
                        ${trader.totalPnl >= 0 ? '+' : ''}{trader.totalPnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-200">{trader.winningTrades}W / {trader.totalTrades - trader.winningTrades}L</div>
                    </div>
                  </div>
                </div>
              )}
              {trader.rank === 3 && (
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold w-12 text-center">{medal}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Trader #{trader.userId.slice(-6)}</h3>
                        <div className="flex gap-4 text-sm text-gray-200">
                          <span>{trader.totalTrades} trades</span>
                          <span>•</span>
                          <span>{trader.winRate.toFixed(1)}% win rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={trader.totalPnl >= 0 ? 'text-3xl font-bold text-green-400' : 'text-3xl font-bold text-red-400'}>
                        ${trader.totalPnl >= 0 ? '+' : ''}{trader.totalPnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-200">{trader.winningTrades}W / {trader.totalTrades - trader.winningTrades}L</div>
                    </div>
                  </div>
                </div>
              )}
              {trader.rank > 3 && (
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold w-12 text-center">{medal}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Trader #{trader.userId.slice(-6)}</h3>
                        <div className="flex gap-4 text-sm text-gray-200">
                          <span>{trader.totalTrades} trades</span>
                          <span>•</span>
                          <span>{trader.winRate.toFixed(1)}% win rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={trader.totalPnl >= 0 ? 'text-3xl font-bold text-green-400' : 'text-3xl font-bold text-red-400'}>
                        ${trader.totalPnl >= 0 ? '+' : ''}{trader.totalPnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-200">{trader.winningTrades}W / {trader.totalTrades - trader.winningTrades}L</div>
                    </div>
                  </div>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}