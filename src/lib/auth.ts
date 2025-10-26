import { cache } from 'react';
import { headers } from 'next/headers';

type AccessLevel = 'admin' | 'member' | 'no_access';

export const verifyUser = cache(
  async ({
    experienceId,
    requiredAccess,
  }: {
    experienceId: string;
    requiredAccess?: 'admin';
  }) => {
    try {
      const headersList = await headers();
      
      // Whop SDK sends user info via these headers when properly configured
      const whopUserId = headersList.get('x-whop-user-id');
      const whopToken = headersList.get('authorization')?.replace('Bearer ', '');
      
      let userId = whopUserId || `user-${Math.random().toString(36).substring(7)}`;
      let username = null;
      
      // If we have a Whop token, fetch user details
      if (whopToken) {
        try {
          const response = await fetch('https://api.whop.com/api/v5/me', {
            headers: {
              'Authorization': `Bearer ${whopToken}`,
            },
            cache: 'no-store',
          });
          
          if (response.ok) {
            const userData = await response.json();
            userId = userData.id || userId;
            username = userData.username || userData.email?.split('@')[0] || null;
          }
        } catch (err) {
          console.error('Failed to fetch Whop user:', err);
        }
      }
      
      // Everyone can access for now
      const accessLevel: AccessLevel = 'admin';

      return { 
        userId, 
        username,
        accessLevel 
      };
    } catch (error) {
      console.error('Auth error:', error);
      return { 
        userId: `user-${Math.random().toString(36).substring(7)}`,
        username: null,
        accessLevel: 'admin' as AccessLevel 
      };
    }
  }
);