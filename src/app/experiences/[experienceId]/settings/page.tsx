import { verifyUser } from '@/lib/auth';
import SettingsClient from './settings-client';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  // Only admins can access settings
  const { userId, accessLevel } = await verifyUser({ 
    experienceId,
    requiredAccess: 'admin' 
  });

  // Block non-admins
  if (accessLevel !== 'admin' || !userId) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/50 text-red-400 p-4 rounded-lg">
            ⛔ Access Denied: Only experience owners can access settings.
          </div>
        </div>
      </div>
    );
  }

  return <SettingsClient experienceId={experienceId} />;
}