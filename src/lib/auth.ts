import { cache } from 'react';
import { headers } from 'next/headers';
import { whopSdk } from './whop-sdk';

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
      
      // Get userId from Whop token in headers
      const { userId } = await whopSdk.verifyUserToken(headersList);
      
      console.log('Got userId from Whop:', userId);
      
      // Fetch user details
      const user = await whopSdk.users.getUser({ userId });
      
      console.log('Got user details:', user);
      
      return { 
        userId, 
        username: user.username || user.name || null,
        accessLevel: 'admin' as AccessLevel 
      };
    } catch (error) {
      console.error('Auth error:', error);
      // Fallback for testing
      return { 
        userId: `fallback-${Date.now()}`,
        username: null,
        accessLevel: 'admin' as AccessLevel 
      };
    }
  }
);