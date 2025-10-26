import { verifyUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Leaderboard } from './components/Leaderboard';
import { StatCard } from './components/StatCard';
import { Competition } from './components/Competition';

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  // This handles authentication and returns user data - ALL SERVER-SIDE
  const { userId, accessLevel } = await verifyUser({ experienceId });

  // Load all trades - SERVER-SIDE
  const allTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.experienceId, experienceId))
    .orderBy(desc(trades.createdAt));

  // All calculations SERVER-SIDE - PARSE STRINGS TO NUMBERS
  const totalPnl = allTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
  const totalTrades = allTrades.length;
  const winningTrades = allTrades.filter(t => parseFloat(t.pnl) > 0).length;
  const avgWinRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrades = allTrades.filter(t => {
    const tradeDate = new Date(t.createdAt);
    return tradeDate >= today;
  });

  const traderStats = new Map();
  
  allTrades.forEach((trade) => {
    if (!traderStats.has(trade.userId)) {
      traderStats.set(trade.userId, {
        userId: trade.userId,
        username: trade.username,
        totalPnl: 0,
        totalTrades: 0,
        winningTrades: 0,
      });
    }
    
    const stats = traderStats.get(trade.userId);
    stats.totalPnl += parseFloat(trade.pnl);
    stats.totalTrades += 1;
    if (parseFloat(trade.pnl) > 0) stats.winningTrades += 1;
  });

  const leaderboardData = Array.from(traderStats.values())
    .map(stats => ({
      ...stats,
      winRate: stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .map((trader, index) => ({
      ...trader,
      rank: index + 1,
    }));

  const bestTrader = leaderboardData[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">TradeProof Dashboard</h1>
        <p className="text-gray-400 mb-8">Track your community's trading performance</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="💰"
            label="Total Community P&L"
            value={`$${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}`}
            subtitle="All time"
            trend={totalPnl >= 0 ? 'up' : 'down'}
            color={totalPnl >= 0 ? 'green' : 'red'}
          />
          
          <StatCard
            icon="📊"
            label="Total Trades"
            value={totalTrades}
            subtitle={`${todayTrades.length} today`}
            color="blue"
          />
          
          <StatCard
            icon="🎯"
            label="Community Win Rate"
            value={`${avgWinRate.toFixed(1)}%`}
            subtitle={`${winningTrades}W / ${totalTrades - winningTrades}L`}
            trend={avgWinRate >= 50 ? 'up' : avgWinRate > 0 ? 'down' : 'neutral'}
            color={avgWinRate >= 50 ? 'green' : 'yellow'}
          />
          
          <StatCard
            icon="👑"
            label="Top Trader"
            value={bestTrader ? `$${bestTrader.totalPnl.toFixed(0)}` : 'N/A'}
            subtitle={bestTrader ? `Trader #${bestTrader.userId.slice(-6)}` : 'No traders yet'}
            color="purple"
          />
        </div>

        <a 
          href={`/experiences/${experienceId}/post-trade`}
          className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold mb-8"
        >
          Post New Trade
        </a>

        <div className="mb-8">
          <Competition allTrades={allTrades} experienceId={experienceId} />
        </div>

        <div className="mb-8">
          <Leaderboard data={leaderboardData} experienceId={experienceId} />
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>
          
          {allTrades.length === 0 ? (
            <p className="text-gray-400">No trades yet. Be the first to post!</p>
          ) : (
            <div className="space-y-4">
              {allTrades.slice(0, 10).map((trade) => {
                const tradePnl = parseFloat(trade.pnl);
                const tradeRoi = parseFloat(trade.roi);
                const tradeEntry = parseFloat(trade.entryPrice);
                const tradeExit = parseFloat(trade.exitPrice);
                
                return (
                  <div 
                    key={trade.id}
                    className="bg-gray-800 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-xl font-bold">{trade.symbol}</h3>
                      <p className="text-sm text-gray-400">
                        ${tradeEntry.toFixed(2)} → ${tradeExit.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${tradePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${tradePnl >= 0 ? '+' : ''}{tradePnl.toFixed(2)}
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