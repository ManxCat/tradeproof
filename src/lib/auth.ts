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
      
      console.log('🔍 User ID:', userId);
      
      // Fetch user details
      const user = await whopSdk.users.getUser({ userId });
      
      console.log('👤 User data:', JSON.stringify(user, null, 2));
      
      // Get user's memberships to check their role
      const memberships = await whopSdk.memberships.getUserMemberships({ userId });
      
      console.log('📋 All memberships:', JSON.stringify(memberships, null, 2));
      
      // Find membership for this experience's company
      const experience = await whopSdk.experiences.getExperience({ experienceId });
      const companyId = experience.company.id;
      
      const relevantMembership = memberships.data?.find((m: any) => 
        m.product?.companyId === companyId || 
        m.companyId === companyId
      );
      
      console.log('🎫 Relevant membership:', JSON.stringify(relevantMembership, null, 2));
      
      // Check if user has admin/owner role
      const role = (relevantMembership as any)?.role || 
                   (relevantMembership as any)?.access_level ||
                   'member';
      
      console.log('👔 User role:', role);
      
      const isAdmin = role === 'owner' || role === 'admin';
      
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