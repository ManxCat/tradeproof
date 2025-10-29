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
      
      // Get the user token from headers
      const userToken = headersList.get('x-whop-user-token');
      
      // Get userId from Whop token in headers
      const { userId } = await whopSdk.verifyUserToken(headersList);
      
      // Fetch user details
      const user = await whopSdk.users.getUser({ userId });
      
      // Check access using the user's token
      const accessResponse = await fetch(
        `https://api.whop.com/api/v5/me/has_access/${experienceId}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          }
        }
      );
      
      if (!accessResponse.ok) {
        console.error('Access check failed:', accessResponse.status, accessResponse.statusText);
        throw new Error('Failed to check access');
      }
      
      const accessData = await accessResponse.json();
      
      console.log('🔐 Access check result:', accessData);
      
      // Map Whop access levels to our access levels
      let accessLevel: AccessLevel;
      if (accessData.access_level === 'admin') {
        accessLevel = 'admin';
      } else if (accessData.access_level === 'customer') {
        accessLevel = 'member';
      } else {
        accessLevel = 'no_access';
      }
      
      return { 
        userId, 
        username: user.username || user.name || null,
        accessLevel
      };
    } catch (error) {
      console.error('Auth error:', error);
      // Fallback to member access if check fails
      return { 
        userId: null,
        username: null,
        accessLevel: 'no_access' as AccessLevel
      };
    }
  }
);