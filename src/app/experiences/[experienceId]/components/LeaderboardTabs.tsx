'use client';

import { useState } from 'react';

type LeaderboardEntry = {
  userId: string;
  username?: string | null;
  totalPnl: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  avgRoi: number;
  rank: number;
};

type LeaderboardType = 'pnl' | 'roi' | 'winrate' | 'active';

export function LeaderboardTabs({ 
  data, 
  experienceId 
}: { 
  data: LeaderboardEntry[]; 
  experienceId: string;
}) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('pnl');

  const tabs = [
    { id: 'pnl' as LeaderboardType, label: '💰 Total P&L' },
    { id: 'roi' as LeaderboardType, label: '📈 Best ROI' },
    { id: 'winrate' as LeaderboardType, label: '🎯 Win Rate' },
    { id: 'active' as LeaderboardType, label: '🔥 Most Active' },
  ];

  const titles = {
    pnl: '💰 Top Traders by P&L',
    roi: '📈 Top Traders by ROI',
    winrate: '🎯 Top Traders by Win Rate',
    active: '🔥 Most Active Traders'
  };

  const getSortedData = () => {
    const sorted = [...data];
    
    switch(activeTab) {
      case 'pnl':
        return sorted.sort((a, b) => b.totalPnl - a.totalPnl)
          .map((trader, index) => ({ ...trader, rank: index + 1 }));
      case 'roi':
        return sorted.sort((a, b) => b.avgRoi - a.avgRoi)
          .map((trader, index) => ({ ...trader, rank: index + 1 }));
      case 'winrate':
        return sorted.sort((a, b) => b.winRate - a.winRate)
          .map((trader, index) => ({ ...trader, rank: index + 1 }));
      case 'active':
        return sorted.sort((a, b) => b.totalTrades - a.totalTrades)
          .map((trader, index) => ({ ...trader, rank: index + 1 }));
      default:
        return sorted;
    }
  };

  const getDisplayValue = (trader: LeaderboardEntry) => {
    switch(activeTab) {
      case 'pnl':
        return `$${trader.totalPnl >= 0 ? '+' : ''}${trader.totalPnl.toFixed(2)}`;
      case 'roi':
        return `${trader.avgRoi.toFixed(1)}%`;
      case 'winrate':
        return `${trader.winRate.toFixed(1)}%`;
      case 'active':
        return `${trader.totalTrades} trades`;
    }
  };

  const sortedData = getSortedData();

  if (data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6">🏆 Leaderboards</h2>
        <p className="text-gray-400 text-center py-8">No traders yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 md:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors text-sm md:text-base ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-6">{titles[activeTab]}</h2>
      
      {/* Leaderboard List */}
      <div className="space-y-3">
        {sortedData.slice(0, 10).map((trader) => {
          const medal = trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : '#' + trader.rank;
          const url = '/experiences/' + experienceId + '/trader/' + trader.userId;
          
          const bgColors = [
            'bg-gradient-to-r from-yellow-500 to-yellow-600',
            'bg-gradient-to-r from-gray-300 to-gray-400',
            'bg-gradient-to-r from-orange-400 to-orange-500',
            'bg-gradient-to-r from-gray-700 to-gray-800'
          ];
          const bgClass = trader.rank <= 3 ? bgColors[trader.rank - 1] : bgColors[3];
          
          return (
            <a key={trader.userId} href={url} className="block">
              <div className={`${bgClass} rounded-lg p-3 md:p-4 hover:scale-105 transition-transform`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                    <div className="text-xl md:text-3xl font-bold w-8 md:w-12 text-center flex-shrink-0">{medal}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-xl font-bold text-white truncate">
                        {trader.username || `Trader #${trader.userId.slice(-6)}`}
                      </h3>
                      <div className="flex gap-2 md:gap-4 text-xs md:text-sm text-gray-200 flex-wrap">
                        <span>{trader.totalTrades} trades</span>
                        <span>•</span>
                        <span>{trader.winRate.toFixed(1)}% win</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-0 flex-shrink-0">
                    <div className="text-lg md:text-3xl font-bold text-white break-words">
                      {getDisplayValue(trader)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-200 whitespace-nowrap">
                      {trader.winningTrades}W / {trader.totalTrades - trader.winningTrades}L
                    </div>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}