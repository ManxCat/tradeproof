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
      
      // Get userId from Whop token
      const { userId } = await whopSdk.verifyUserToken(headersList);
      
      // Fetch user details
      const user = await whopSdk.users.getUser({ userId });
      
      // TODO: Implement proper access level checking
      // The Whop SDK docs mention users.checkAccess() but this method
      // is not available in @whop-apps/sdk version 0.0.1-canary.117
      // REST API endpoint /api/v5/me/has_access/ returns empty responses
      // Seeking guidance from Whop on the correct implementation
      
      // TEMPORARY: All authenticated users are admins
      const accessLevel: AccessLevel = 'admin';
      
      return { 
        userId, 
        username: user.username || user.name || null,
        accessLevel
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