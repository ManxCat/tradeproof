import { verifyUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Helper function to format large numbers
function formatCurrency(num: number): string {
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000) {
    return `${num >= 0 ? '+' : ''}$${(num / 1000000).toFixed(1)}M`;
  }
  if (absNum >= 1000) {
    return `${num >= 0 ? '+' : ''}$${(num / 1000).toFixed(1)}K`;
  }
  return `${num >= 0 ? '+' : ''}$${num.toFixed(2)}`;
}

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ experienceId: string; userId: string }>;
}) {
  const { experienceId, userId } = await params;
  await verifyUser({ experienceId });

  // Get all trades for this trader
  const allTraderTrades = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.experienceId, experienceId),
        eq(trades.userId, userId)
      )
    )
    .orderBy(desc(trades.createdAt));

  // Filter to only approved trades
  const traderTrades = allTraderTrades.filter(t => t.status === 'approved');
  
  const traderName = traderTrades[0]?.username || `Trader #${userId.slice(-6)}`;
  const totalTrades = traderTrades.length;
  const totalPnl = traderTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
  const winningTrades = traderTrades.filter(t => parseFloat(t.pnl) > 0).length;
  const losingTrades = traderTrades.filter(t => parseFloat(t.pnl) < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
  const bestTrade = traderTrades.length > 0 ? Math.max(...traderTrades.map(t => parseFloat(t.pnl))) : 0;
  const worstTrade = traderTrades.length > 0 ? Math.min(...traderTrades.map(t => parseFloat(t.pnl))) : 0;

  // Calculate current streak
  let currentStreak = 0;
  let streakType: 'win' | 'loss' | null = null;
  for (const trade of traderTrades) {
    if (parseFloat(trade.pnl) > 0) {
      if (streakType === 'win' || streakType === null) {
        currentStreak++;
        streakType = 'win';
      } else break;
    } else if (parseFloat(trade.pnl) < 0) {
      if (streakType === 'loss' || streakType === null) {
        currentStreak++;
        streakType = 'loss';
      } else break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <a 
          href={`/experiences/${experienceId}`}
          className="text-gray-400 hover:text-white mb-4 inline-block"
        >
          ← Back to Dashboard
        </a>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h1 className="text-4xl font-bold">{traderName}</h1>
            <p className="text-gray-400">Trader Profile</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Total P&L</div>
            <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalPnl)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-white">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">{winningTrades}W / {losingTrades}L</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Total Trades</div>
            <div className="text-3xl font-bold text-white">{totalTrades}</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-white">
              {currentStreak > 0 && (
                <>
                  {streakType === 'win' ? '🔥' : '❄️'} {currentStreak}
                </>
              )}
              {currentStreak === 0 && '-'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Avg P&L</div>
            <div className={`text-2xl font-bold ${avgPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(avgPnl)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Best Trade</div>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(bestTrade)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Worst Trade</div>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(worstTrade)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Avg ROI</div>
            <div className="text-2xl font-bold text-purple-500">
              {totalTrades > 0 ? (traderTrades.reduce((sum, t) => sum + parseFloat(t.roi), 0) / totalTrades).toFixed(1) : '0'}%
            </div>
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Trade History</h2>
          
          {traderTrades.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No approved trades yet</p>
          ) : (
            <div className="space-y-3">
              {traderTrades.map((trade) => {
                const tradePnl = parseFloat(trade.pnl);
                const tradeRoi = parseFloat(trade.roi);
                
                return (
                  <div 
                    key={trade.id}
                    className="bg-gray-800 rounded-lg p-4 flex justify-between items-center border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        tradePnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {tradePnl >= 0 ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{trade.symbol}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            trade.positionType === 'long' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {trade.positionType?.toUpperCase() || 'LONG'}
                          </span>
                          {trade.leverage && parseFloat(trade.leverage) > 1 && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-900 text-purple-300">
                              {trade.leverage}x
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                            {trade.assetType?.toUpperCase() || 'STOCK'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          ${parseFloat(trade.entryPrice).toFixed(2)} → ${parseFloat(trade.exitPrice).toFixed(2)} • ${parseFloat(trade.positionSize).toFixed(0)} position
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${tradePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(tradePnl)}
                      </p>
                      <p className={`text-sm ${tradeRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tradeRoi.toFixed(2)}% ROI
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}