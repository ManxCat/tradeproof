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
      
      // Decode the JWT to get userId (simple base64 decode of payload)
      const payload = JSON.parse(
        Buffer.from(userTokenHeader.split('.')[1], 'base64').toString()
      );
      const userId = payload.sub;
      
      // Check access using the correct SDK
      const accessCheck = await whopSdk.users.checkAccess(experienceId, { 
        id: userId 
      });
      
      console.log('🔐 Access check result:', accessCheck);
      
      // Map Whop access levels to our access levels
      let accessLevel: AccessLevel;
      if (accessCheck.access_level === 'admin') {
        accessLevel = 'admin';
      } else if (accessCheck.access_level === 'customer') {
        accessLevel = 'member';
      } else {
        accessLevel = 'no_access';
      }
      
      // Get user details for username
      const userResponse = await fetch(`https://api.whop.com/api/v5/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        }
      });
      const user = await userResponse.json();
      
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