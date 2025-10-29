'use client';

import { useState, useEffect } from 'react';

export function Competition({ allTrades, experienceId }: { allTrades: any[]; experienceId: string }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/settings?experienceId=${experienceId}`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load competition settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [experienceId]);

  // Don't show if disabled or still loading
  if (loading) return null;
  if (!settings?.competitionEnabled) return null;

  const period = settings.competitionPeriod || 'weekly';
  const title = settings.competitionTitle || 'Weekly Competition';
  const prize = settings.competitionPrize || 'Top trader gets bragging rights! 🏆';

  // Calculate period dates based on settings
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  if (period === 'daily') {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    periodLabel = 'Today';
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    periodLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else {
    // Weekly (default)
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate = new Date(now);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  // Filter trades for this period
  const periodTrades = allTrades.filter(trade => {
    const tradeDate = new Date(trade.createdAt);
    return tradeDate >= startDate && tradeDate <= endDate;
  });

  // Calculate stats per trader
  const statsMap = new Map();
  
  periodTrades.forEach((trade) => {
    if (!statsMap.has(trade.userId)) {
      statsMap.set(trade.userId, {
        userId: trade.userId,
        username: trade.username,
        pnl: 0,
        trades: 0,
        wins: 0,
      });
    }
    
    const stats = statsMap.get(trade.userId);
    const tradePnl = parseFloat(trade.pnl);
    stats.pnl += tradePnl;
    stats.trades += 1;
    if (tradePnl > 0) stats.wins += 1;
  });

  // Create leaderboard
  const leaders = Array.from(statsMap.values())
    .map((s: any) => ({
      userId: s.userId,
      username: s.username,
      pnl: s.pnl,
      trades: s.trades,
      winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  const timeLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const timeUnit = period === 'daily' ? 'hours' : 'days';
  const timeValue = period === 'daily' 
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60))
    : timeLeft;

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🏆 {title}</h2>
          <p className="text-sm text-gray-400">{periodLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Ends in</div>
          <div className="text-2xl font-bold text-yellow-400">
            {timeValue} {timeUnit}
          </div>
        </div>
      </div>

      {/* Prize Description */}
      <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-400/20 rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-lg font-semibold text-yellow-400 mb-1">Prize</div>
          <div className="text-white whitespace-pre-wrap">{prize}</div>
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
            <p className="text-sm text-gray-500 mt-2">Post trades this {period === 'daily' ? 'today' : period === 'monthly' ? 'month' : 'week'} to enter</p>
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
                        {entry.username || `Trader #${entry.userId.slice(-6)}`}
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
          <span>Competition resets {period === 'daily' ? 'daily' : period === 'monthly' ? 'monthly' : 'weekly'}.</span>
        </div>
      </div>
    </div>
  );
}