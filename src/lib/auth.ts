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
      const userTokenHeader = headersList.get('x-whop-user-token');
      if (!userTokenHeader) {
        throw new Error('No user token found');
      }
      
      // Decode the JWT to get userId and username
      const payload = JSON.parse(
        Buffer.from(userTokenHeader.split('.')[1], 'base64').toString()
      );
      const userId = payload.sub;
      const username = payload.username || null;
      
      // Check access using the SDK
      const accessCheck = await whopSdk.users.checkAccess(experienceId, { 
        id: userId 
      });
      
     
      
      // Map Whop access levels
      let accessLevel: AccessLevel;
      if (accessCheck.access_level === 'admin') {
        accessLevel = 'admin';
      } else if (accessCheck.access_level === 'customer') {
        accessLevel = 'member';
      } else {
        accessLevel = 'no_access';
      }
      
      return { 
        userId, 
        username,
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