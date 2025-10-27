import { verifyUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { approveTrade, rejectTrade } from './actions';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  // Verify admin access
  const { userId, accessLevel } = await verifyUser({ 
    experienceId,
    requiredAccess: 'admin' 
  });

  // Get all pending trades
  const pendingTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.experienceId, experienceId))
    .orderBy(desc(trades.createdAt));

  const pending = pendingTrades.filter(t => t.status === 'pending');
  const approved = pendingTrades.filter(t => t.status === 'approved');
  const rejected = pendingTrades.filter(t => t.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Review and manage trades</p>
          </div>
          <a 
            href={`/experiences/${experienceId}`}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{pending.length}</div>
            <div className="text-sm text-yellow-300">Pending Review</div>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">{approved.length}</div>
            <div className="text-sm text-green-300">Approved</div>
          </div>
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-400">{rejected.length}</div>
            <div className="text-sm text-red-300">Rejected</div>
          </div>
        </div>

        {/* Pending Trades */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">⏳ Pending Trades</h2>
          
          {pending.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending trades to review</p>
          ) : (
            <div className="space-y-4">
              {pending.map((trade) => {
                const tradePnl = parseFloat(trade.pnl);
                const tradeRoi = parseFloat(trade.roi);
                
                return (
                  <div key={trade.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
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
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          Trader: {trade.username || `#${trade.userId.slice(-6)}`}
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          Entry: ${parseFloat(trade.entryPrice).toFixed(2)} → Exit: ${parseFloat(trade.exitPrice).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Size: ${parseFloat(trade.positionSize).toFixed(2)}
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

                    {trade.screenshot && (
                      <div className="mb-4">
                        <img 
                          src={trade.screenshot} 
                          alt="Trade screenshot" 
                          className="max-w-md rounded border border-gray-700"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <form action={approveTrade} className="flex-1">
                        <input type="hidden" name="tradeId" value={trade.id} />
                        <input type="hidden" name="experienceId" value={experienceId} />
                        <button 
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
                        >
                          ✅ Approve
                        </button>
                      </form>
                      
                      <form action={rejectTrade} className="flex-1">
                        <input type="hidden" name="tradeId" value={trade.id} />
                        <input type="hidden" name="experienceId" value={experienceId} />
                        <button 
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-semibold"
                        >
                          ❌ Reject
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Approved */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">✅ Recently Approved ({approved.length})</h2>
          <div className="space-y-2">
            {approved.slice(0, 5).map((trade) => (
              <div key={trade.id} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold">{trade.symbol}</span>
                  <span className="text-gray-400 ml-2">by {trade.username || `#${trade.userId.slice(-6)}`}</span>
                </div>
                <span className={parseFloat(trade.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${parseFloat(trade.pnl) >= 0 ? '+' : ''}{parseFloat(trade.pnl).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Rejected */}
        {rejected.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">❌ Recently Rejected ({rejected.length})</h2>
            <div className="space-y-2">
              {rejected.slice(0, 5).map((trade) => (
                <div key={trade.id} className="bg-gray-800 rounded p-3 flex justify-between items-center opacity-50">
                  <div>
                    <span className="font-bold">{trade.symbol}</span>
                    <span className="text-gray-400 ml-2">by {trade.username || `#${trade.userId.slice(-6)}`}</span>
                  </div>
                  <span className="text-gray-400">Rejected</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}