'use client';

import { useState, useEffect } from 'react';

interface SettingsClientProps {
  experienceId: string;
}

export default function SettingsClient({ experienceId }: SettingsClientProps) {
  // Cancellation settings
  const [minChars, setMinChars] = useState(20);
  
  // Competition settings
  const [competitionEnabled, setCompetitionEnabled] = useState(true);
  const [competitionPeriod, setCompetitionPeriod] = useState('weekly');
  const [competitionTitle, setCompetitionTitle] = useState('Weekly Competition');
  const [competitionPrize, setCompetitionPrize] = useState('Top trader gets bragging rights! 🏆');
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/settings?experienceId=${experienceId}`);
        if (res.ok) {
          const data = await res.json();
          const settings = data.settings;
          
          // Load cancellation settings
          setMinChars(settings?.minCancellationCharacters || 20);
          
          // Load competition settings
          setCompetitionEnabled(settings?.competitionEnabled ?? true);
          setCompetitionPeriod(settings?.competitionPeriod || 'weekly');
          setCompetitionTitle(settings?.competitionTitle || 'Weekly Competition');
          setCompetitionPrize(settings?.competitionPrize || 'Top trader gets bragging rights! 🏆');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    
    loadSettings();
  }, [experienceId]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          minCancellationCharacters: minChars,
          competitionEnabled,
          competitionPeriod,
          competitionTitle,
          competitionPrize
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

          {/* Competition Settings */}
          <div className="mb-8 pb-8 border-b border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Competition Settings</h2>
            
            {/* Enable/Disable Competition */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={competitionEnabled}
                  onChange={(e) => setCompetitionEnabled(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700"
                />
                <span className="text-sm font-medium">Enable Competition</span>
              </label>
              <p className="text-sm text-gray-500 mt-2 ml-8">
                Show weekly/daily/monthly competition leaderboard to your members
              </p>
            </div>

            {/* Competition Period */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Competition Period
              </label>
              <select
                value={competitionPeriod}
                onChange={(e) => setCompetitionPeriod(e.target.value)}
                disabled={!competitionEnabled}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                How often the competition resets
              </p>
            </div>

            {/* Competition Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Competition Title
              </label>
              <input
                type="text"
                value={competitionTitle}
                onChange={(e) => setCompetitionTitle(e.target.value)}
                disabled={!competitionEnabled}
                placeholder="Weekly Competition"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50"
              />
              <p className="text-sm text-gray-500 mt-2">
                Custom title shown to your members
              </p>
            </div>

            {/* Competition Prize */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Prize Description
              </label>
              <textarea
                value={competitionPrize}
                onChange={(e) => setCompetitionPrize(e.target.value)}
                disabled={!competitionEnabled}
                placeholder="Top trader gets bragging rights! 🏆"
                rows={3}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50"
              />
              <p className="text-sm text-gray-500 mt-2">
                Describe the prize or reward for winners
              </p>
            </div>
          </div>

          {/* Cancellation Settings */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Cancellation Settings</h2>
            
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

          {/* Status Messages */}
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save All Settings'}
            </button>

            <a
              href={`/experiences/${experienceId}`}
              className="text-center px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}