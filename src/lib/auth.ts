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
      
      // Fetch experience
      const experience = await whopSdk.experiences.getExperience({ experienceId });
      
      console.log('🔍 USER OBJECT:', JSON.stringify(user, null, 2));
      console.log('📦 EXPERIENCE:', JSON.stringify(experience, null, 2));
      console.log('🏢 COMPANY ID:', experience.company.id);
      console.log('👤 USER ID:', userId);
      
      // Check what methods are available
      console.log('🔧 Available SDK methods:', Object.keys(whopSdk));
      
      // TEMPORARY: Make everyone admin until we figure out the right method
      const isAdmin = true;
      
      return { 
        userId, 
        username: user.username || user.name || null,
        accessLevel: isAdmin ? 'admin' : 'member' as AccessLevel
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