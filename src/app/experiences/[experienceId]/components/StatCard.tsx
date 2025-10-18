'use client';

import { AnimatedCounter } from './AnimatedCounter';

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'purple' | 'yellow';
  animate?: boolean;
};

export function StatCard({ icon, label, value, subtitle, trend, color = 'blue', animate = true }: StatCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '';

  // Parse numeric value for animation
  const isNumeric = typeof value === 'number';
  const numericValue = isNumeric ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const shouldAnimate = animate && !isNaN(numericValue);

  // Extract prefix and suffix from string value
  let prefix = '';
  let suffix = '';
  if (typeof value === 'string') {
    const match = value.match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);
    if (match) {
      prefix = match[1];
      suffix = match[3];
    }
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {trend && <span className="text-xl">{trendIcon}</span>}
      </div>
      
      <div className="text-gray-400 text-sm font-medium mb-1">{label}</div>
      
      <div className="text-3xl font-bold text-white mb-1">
        {shouldAnimate ? (
          <AnimatedCounter value={numericValue} prefix={prefix} suffix={suffix} />
        ) : (
          value
        )}
      </div>
      
      {subtitle && (
        <div className="text-gray-400 text-xs">{subtitle}</div>
      )}
    </div>
  );
}