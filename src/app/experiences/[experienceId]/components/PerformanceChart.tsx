'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

type ChartData = {
  date: string;
  pnl: number;
  cumulative: number;
};

export function PerformanceChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Performance Over Time</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  const maxPnl = Math.max(...data.map(d => d.cumulative));
  const minPnl = Math.min(...data.map(d => d.cumulative));
  const isProfit = data[data.length - 1].cumulative >= 0;

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-4">📊 Performance Over Time</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isProfit ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isProfit ? "#10b981" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
          />
          <Area 
            type="monotone" 
            dataKey="cumulative" 
            stroke={isProfit ? "#10b981" : "#ef4444"}
            strokeWidth={3}
            fill="url(#colorPnl)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}