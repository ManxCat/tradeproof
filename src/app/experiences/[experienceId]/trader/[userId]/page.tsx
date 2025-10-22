import { verifyUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { PerformanceChart } from '../../components/PerformanceChart';
import { StreakBadge } from '../../components/StreakBadge';
import { AchievementsList } from '../../components/AchievementBadge';
import { TraderLevel } from '../../components/TraderLevel';
import { DailyChallenges } from '../../components/DailyChallenges';

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ experienceId: string; userId: string }>;
}) {
  const { experienceId, userId } = await params;
  await verifyUser({ experienceId });

  const traderTrades = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.experienceId, experienceId),
        eq(trades.userId, userId)
      )
    )
    .orderBy(desc(trades.createdAt));

  const totalTrades = traderTrades.length;
  const totalPnl = traderTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
  const winningTrades = traderTrades.filter(t => parseFloat(t.pnl) > 0).length;
  const losingTrades = traderTrades.filter(t => parseFloat(t.pnl) < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
  const bestTrade = traderTrades.length > 0 ? Math.max(...traderTrades.map(t => parseFloat(t.pnl))) : 0;
  const worstTrade = traderTrades.length > 0 ? Math.min(...traderTrades.map(t => parseFloat(t.pnl))) : 0;

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

  const chartData = traderTrades.slice().reverse().map((trade, index, arr) => {
    const cumulative = arr.slice(0, index + 1).reduce((sum, t) => sum + parseFloat(t.pnl), 0);
    return {
      date: new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl: parseFloat(trade.pnl),
      cumulative: cumulative
    };
  });

  // Calculate achievements
  const achievements: string[] = [];
  
  if (traderTrades.length > 0) achievements.push('first_blood');
  
  if (totalPnl > 0) achievements.push('profitable');
  
  if (traderTrades.length >= 100) achievements.push('century_club');
  
  if (traderTrades.some(t => parseFloat(t.positionSize) >= 10000)) achievements.push('whale');
  
  let maxWinStreak = 0;
  let winStreakCount = 0;
  for (const trade of traderTrades) {
    if (parseFloat(trade.pnl) > 0) {
      winStreakCount++;
      maxWinStreak = Math.max(maxWinStreak, winStreakCount);
    } else {
      winStreakCount = 0;
    }
  }
  if (maxWinStreak >= 3) achievements.push('hot_streak');
  
  if (traderTrades.length >= 5 && winningTrades === traderTrades.length) {
    achievements.push('perfect_week');
  }
  
  let maxConsecutive = traderTrades.length;
  if (maxConsecutive >= 10) achievements.push('diamond_hands');

  // Get today's trades for challenges
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrades = traderTrades.filter(t => {
    const tradeDate = new Date(t.createdAt);
    return tradeDate >= today;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <a 
          href={`/experiences/${experienceId}`}
          className="text-gray-400 hover:text-white mb-4 inline-block"
        >
          ← Back to Dashboard
        </a>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h1 className="text-4xl font-bold">Trader #{userId.slice(-6)}</h1>
            <p className="text-gray-400">Member Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Total P&L</div>
            <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
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
              ${avgPnl >= 0 ? '+' : ''}{avgPnl.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Best Trade</div>
            <div className="text-2xl font-bold text-green-500">
              ${bestTrade >= 0 ? '+' : ''}{bestTrade.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Worst Trade</div>
            <div className="text-2xl font-bold text-red-500">
              ${worstTrade.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Rank</div>
            <div className="text-3xl font-bold text-yellow-500">
              🏆
            </div>
          </div>
        </div>

        {traderTrades.length > 0 && (
          <div className="mb-8">
            <PerformanceChart data={chartData} />
          </div>
        )}

        <div className="mb-8">
          <AchievementsList achievements={achievements} />
        </div>

        <div className="mb-8">
          <TraderLevel totalTrades={totalTrades} totalPnl={totalPnl} />
        </div>

        <div className="mb-8">
          <DailyChallenges todayTrades={todayTrades} totalTrades={totalTrades} />
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Trade History</h2>
          
          {traderTrades.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No trades yet</p>
          ) : (
            <div className="space-y-3">
              {traderTrades.map((trade, index) => {
                let streakCount = 1;
                let tradeStreakType: 'win' | 'loss' = parseFloat(trade.pnl) > 0 ? 'win' : 'loss';
                
                for (let i = index - 1; i >= 0; i--) {
                  const prevTrade = traderTrades[i];
                  if ((tradeStreakType === 'win' && parseFloat(prevTrade.pnl) > 0) || (tradeStreakType === 'loss' && parseFloat(prevTrade.pnl) < 0)) {
                    streakCount++;
                  } else {
                    break;
                  }
                }

                return (
                  <div 
                    key={trade.id}
                    className="bg-gray-800 rounded-lg p-4 flex justify-between items-center border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        parseFloat(trade.pnl) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {parseFloat(trade.pnl) >= 0 ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{trade.symbol}</h3>
                          <StreakBadge streak={streakCount} type={tradeStreakType} size="sm" />
                        </div>
                        <p className="text-sm text-gray-400">
                          ${trade.entryPrice} → ${trade.exitPrice} • ${parseFloat(trade.positionSize).toFixed(0)} position
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${parseFloat(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${parseFloat(trade.pnl) >= 0 ? '+' : ''}{parseFloat(trade.pnl).toFixed(2)}
                      </p>
                      <p className={`text-sm ${parseFloat(trade.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(trade.roi).toFixed(2)}% ROI
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