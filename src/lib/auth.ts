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
      
      // Fetch experience to get company ID
      const experience = await whopSdk.experiences.getExperience({ experienceId });
      
      console.log('📦 FULL EXPERIENCE OBJECT:', JSON.stringify(experience, null, 2));
      console.log('🏢 FULL COMPANY OBJECT:', JSON.stringify(experience.company, null, 2));
      
      // Try to fetch company details
      try {
        const company = await whopSdk.companies.getCompany({ companyId: experience.company.id });
        console.log('🏭 FULL COMPANY DETAILS:', JSON.stringify(company, null, 2));
      } catch (err) {
        console.error('Failed to fetch company:', err);
      }
      
      // For now, make everyone admin
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