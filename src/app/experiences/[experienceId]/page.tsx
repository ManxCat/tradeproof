import { verifyUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Leaderboard } from './components/Leaderboard';
import { StatCard } from './components/StatCard';
import { Competition } from './components/Competition';
import { LeaderboardTabs } from './components/LeaderboardTabs';
import AdminView from './admin/page';
import SettingsClient from './settings/settings-client';

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ experienceId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { experienceId } = await params;
  const { view } = await searchParams;
  
  // This handles authentication and returns user data - ALL SERVER-SIDE
  const { userId, accessLevel } = await verifyUser({ experienceId });

  // Show admin view if requested and user is admin
  if (view === 'admin') {
    if (accessLevel !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/50 text-red-400 p-4 rounded-lg">
              ⛔ Access Denied: Only experience owners can access the admin panel.
            </div>
          </div>
        </div>
      );
    }
    return <AdminView params={Promise.resolve({ experienceId })} />;
  }

  // Show settings view if requested and user is admin
  if (view === 'settings') {
    if (accessLevel !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/50 text-red-400 p-4 rounded-lg">
              ⛔ Access Denied: Only experience owners can access settings.
            </div>
          </div>
        </div>
      );
    }
    return <SettingsClient experienceId={experienceId} />;
  }

  // Default: Show dashboard
  // Load all trades - SERVER-SIDE
  const allTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.experienceId, experienceId))
    .orderBy(desc(trades.createdAt));

  // Filter to only show approved trades in leaderboards
  const approvedTrades = allTrades.filter(t => t.status === 'approved');

  // All calculations SERVER-SIDE - PARSE STRINGS TO NUMBERS - APPROVED ONLY
  const totalPnl = approvedTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
  const totalTrades = approvedTrades.length;
  const winningTrades = approvedTrades.filter(t => parseFloat(t.pnl) > 0).length;
  const avgWinRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrades = approvedTrades.filter(t => {
    const tradeDate = new Date(t.createdAt);
    return tradeDate >= today;
  });

  const traderStats = new Map();
  
  approvedTrades.forEach((trade) => {
    if (!traderStats.has(trade.userId)) {
      traderStats.set(trade.userId, {
        userId: trade.userId,
        username: trade.username,
        totalPnl: 0,
        totalTrades: 0,
        winningTrades: 0,
        totalRoi: 0,
      });
    }
    
    const stats = traderStats.get(trade.userId);
    stats.totalPnl += parseFloat(trade.pnl);
    stats.totalTrades += 1;
    stats.totalRoi += parseFloat(trade.roi);
    if (parseFloat(trade.pnl) > 0) stats.winningTrades += 1;
  });

  const leaderboardData = Array.from(traderStats.values())
    .map(stats => ({
      ...stats,
      winRate: stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0,
      avgRoi: stats.totalTrades > 0 ? stats.totalRoi / stats.totalTrades : 0,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .map((trader, index) => ({
      ...trader,
      rank: index + 1,
    }));

  const bestTrader = leaderboardData[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">TradeProof Dashboard</h1>
            <p className="text-gray-400">Track your community's trading performance</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2">
            <a
              href={`/experiences/${experienceId}`}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
            >
              Dashboard
            </a>
            {accessLevel === 'admin' && (
              <>
                <a
                  href={`/experiences/${experienceId}?view=admin`}
                  className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm"
                >
                  Admin
                </a>
                <a
                  href={`/experiences/${experienceId}?view=settings`}
                  className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm"
                >
                  Settings
                </a>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
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
            icon="📈"
            label="Win Rate"
            value={`${avgWinRate.toFixed(1)}%`}
            subtitle={`${winningTrades}/${totalTrades} wins`}
            color="purple"
          />
          
          <StatCard
            icon="🏆"
            label="Top Trader"
            value={bestTrader?.username || 'None'}
            subtitle={bestTrader ? `$${bestTrader.totalPnl >= 0 ? '+' : ''}${bestTrader.totalPnl.toFixed(2)}` : 'No trades yet'}
            color="yellow"
          />
        </div>

        <Competition experienceId={experienceId} leaderboardData={leaderboardData} />

        <LeaderboardTabs 
          experienceId={experienceId}
          leaderboardData={leaderboardData}
        />

        <a 
          href={`/experiences/${experienceId}/post-trade`}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2"
        >
          + Post New Trade
        </a>

        <div className="bg-gray-900 rounded-lg p-4 md:p-6 mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Recent Trades</h2>
          
          {approvedTrades.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No approved trades yet. Be the first to post!</p>
          ) : (
            <div className="space-y-3">
              {approvedTrades.slice(0, 10).map((trade) => {
                const tradePnl = parseFloat(trade.pnl);
                const tradeRoi = parseFloat(trade.roi);
                const tradeEntry = parseFloat(trade.entryPrice);
                const tradeExit = parseFloat(trade.exitPrice);
                
                return (
                  <div 
                    key={trade.id}
                    className="bg-gray-800 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg md:text-xl font-bold">{trade.symbol}</h3>
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
                        ${tradeEntry.toFixed(2)} → ${tradeExit.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right w-full sm:w-auto">
                      <p className={`text-xl md:text-2xl font-bold ${tradePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${tradePnl >= 0 ? '+' : ''}{tradePnl.toFixed(2)}
                      </p>
                      <p className={`text-xs md:text-sm ${tradeRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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