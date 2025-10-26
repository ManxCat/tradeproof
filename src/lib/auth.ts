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
    try {
      const headersList = await headers();
      
      // Get user ID from Whop headers
      // Whop sends this in the iframe request
      const userId = headersList.get('x-whop-user-id') || 
                     headersList.get('x-user-id') ||
                     `anonymous-${Date.now()}`;
      
      console.log('Auth headers:', {
        'x-whop-user-id': headersList.get('x-whop-user-id'),
        'x-user-id': headersList.get('x-user-id'),
        'authorization': headersList.get('authorization'),
        userId,
      });
      
      // For now, all authenticated users are admins
      // Later you can add role checking from Whop
      const accessLevel: AccessLevel = userId.startsWith('anonymous') ? 'member' : 'admin';

      if (requiredAccess === 'admin' && accessLevel !== 'admin') {
        throw new Error('Admin access required');
      }

      return { userId, accessLevel };
    } catch (error) {
      console.error('Auth error:', error);
      // Fallback for development
      return { 
        userId: `fallback-${Date.now()}`, 
        accessLevel: 'admin' as AccessLevel 
      };
    }
  }
);