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
      
      // Fetch user details
      const user = await whopSdk.users.getUser({ userId });
      
      // TEMPORARY: Make everyone admin for testing
      // TODO: Implement proper company ownership check after Whop review
      console.log('⚠️ TEMPORARY: All users are admins for testing');
      
      return { 
        userId, 
        username: user.username || user.name || null,
        accessLevel: 'admin' as AccessLevel
      };
    } catch (error) {
      console.error('Auth error:', error);
      return { 
        userId: null,
        username: null,
        accessLevel: 'no_access' as AccessLevel
      };
    }
  }
);