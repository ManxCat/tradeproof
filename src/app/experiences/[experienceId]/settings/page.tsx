'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage({
  params,
}: {
  params: { experienceId: string };
}) {
  const [minChars, setMinChars] = useState(20);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/settings?experienceId=${params.experienceId}`);
        if (res.ok) {
          const data = await res.json();
          setMinChars(data.settings?.minCancellationCharacters || 20);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    
    loadSettings();
  }, [params.experienceId]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: params.experienceId,
          minCancellationCharacters: minChars
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">TradeProof Settings</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Minimum Feedback Length for Cancellations
            </label>
            
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="500"
                value={minChars}
                onChange={(e) => setMinChars(Number(e.target.value))}
                className="w-32 p-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
              <span className="text-gray-400">characters</span>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Members must provide at least this many characters of feedback when cancelling. 
              Recommended: 20-50 characters.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-900/50 text-green-400 p-3 rounded-lg mb-4">
              Settings saved successfully!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}