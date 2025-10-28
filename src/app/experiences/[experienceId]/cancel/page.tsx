'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CancelPage({
  params,
}: {
  params: { experienceId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minChars, setMinChars] = useState(20);
  
  const membershipId = searchParams.get('membership_id') || '';
  const userId = searchParams.get('user_id') || '';

  // Load settings to get min character requirement
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (feedback.length < minChars) {
      setError(`Please provide at least ${minChars} characters of feedback`);
      return;
    }

    if (!membershipId || !userId) {
      setError('Missing membership or user information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cancel-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: params.experienceId,
          membershipId,
          userId,
          feedback
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel membership');
      }

      // Success!
      alert('Your membership has been cancelled. Sorry to see you go!');
      
      // Redirect back to Whop
      window.location.href = 'https://whop.com/hub';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const characterCount = feedback.length;
  const isValid = characterCount >= minChars;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Cancel Membership</h1>
          
          <p className="text-gray-400 mb-6">
            We're sorry to see you go! Please tell us why you're cancelling so we can improve.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Why are you cancelling? 
                <span className="text-gray-500 ml-2">
                  ({characterCount}/{minChars} characters minimum)
                </span>
              </label>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={`w-full p-3 bg-gray-800 border rounded-lg h-32 ${
                  characterCount > 0 && !isValid ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Please share your honest feedback..."
                required
              />
              
              {characterCount > 0 && !isValid && (
                <p className="text-red-500 text-sm mt-1">
                  Need {minChars - characterCount} more characters
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800"
              >
                Keep Membership
              </button>
              
              <button
                type="submit"
                disabled={loading || !isValid}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}