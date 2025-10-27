import { verifyUser } from '@/lib/auth';
import { submitTrade } from './actions';

export default async function PostTradePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const { userId, accessLevel } = await verifyUser({ 
    experienceId,
    requiredAccess: 'admin' 
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Post New Trade</h1>
        
        <form action={async (formData) => {
          'use server';
          await submitTrade(formData, experienceId);
        }} className="bg-gray-900 rounded-lg p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Position Type</label>
              <select 
                name="positionType"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
                required
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Asset Type</label>
              <select 
                name="assetType"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
                required
              >
                <option value="stock">Stock</option>
                <option value="option">Option</option>
                <option value="crypto">Crypto</option>
                <option value="futures">Futures</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Symbol</label>
            <input 
              type="text"
              name="symbol"
              placeholder="e.g. AAPL, BTC/USD, SPY 450C"
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Entry Price</label>
              <input 
                type="number"
                step="0.01"
                name="entryPrice"
                placeholder="100.00"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Exit Price</label>
              <input 
                type="number"
                step="0.01"
                name="exitPrice"
                placeholder="105.00"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Position Size ($)</label>
              <input 
                type="number"
                step="0.01"
                name="positionSize"
                placeholder="1000.00"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Leverage</label>
              <select 
                name="leverage"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2"
                required
              >
                <option value="1">1x (No Leverage)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="5">5x</option>
                <option value="10">10x</option>
                <option value="20">20x</option>
                <option value="50">50x</option>
                <option value="100">100x</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold"
          >
            Submit Trade
          </button>
        </form>

        <a 
          href={`/experiences/${experienceId}`}
          className="block text-center mt-4 text-gray-400 hover:text-white"
        >
          ← Back to Leaderboard
        </a>
      </div>
    </div>
  );
}