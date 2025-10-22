import { headers } from 'next/headers';
import { cache } from 'react';

type AccessLevel = 'admin' | 'member' | 'no_access';

export const verifyUser = cache(
  async ({
    experienceId,
    requiredAccess,
  }: {
    experienceId: string;
    requiredAccess?: 'admin';
  }) => {
    const headersList = await headers();
    
    // Get user ID from Whop headers
    const userId = headersList.get('x-whop-user-id') || 'anonymous';
    
    // For now, assume everyone is admin in dev mode
    const accessLevel: AccessLevel = 'admin';

    if (requiredAccess === 'admin' && accessLevel !== 'admin') {
      throw new Error('Admin access required');
    }

    if (accessLevel !== 'admin') {
      throw new Error('No access to this experience');
    }

    return { userId, accessLevel };
  }
);