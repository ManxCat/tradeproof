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
      
      // Fetch experience to get company ID
      const experience = await whopSdk.experiences.getExperience({ experienceId });
      
      console.log('Experience data:', experience);
      
      // Check if user owns the company that this experience belongs to
      const isAdmin = await isCompanyOwner(userId, experience.companyId);
      
      return { 
        userId, 
        username: user.username || user.name || null,
        accessLevel: isAdmin ? 'admin' : 'member' as AccessLevel
      };
    } catch (error) {
      console.error('Auth error:', error);
      // Fallback - NO ACCESS if auth fails
      return { 
        userId: null,
        username: null,
        accessLevel: 'no_access' as AccessLevel
      };
    }
  }
);

// Check if user owns the company
async function isCompanyOwner(userId: string, companyId: string): Promise<boolean> {
  try {
    // Fetch the company details
    const company = await whopSdk.companies.getCompany({ companyId });
    
    console.log('Company data:', company);
    
    // Check if user is the company owner
    const ownerId = (company as any).ownerId || 
                    (company as any).owner_id || 
                    (company as any).created_by ||
                    (company as any).userId;
    
    console.log('Company owner check:', {
      userId,
      companyId,
      ownerId,
      isOwner: ownerId === userId
    });
    
    return ownerId === userId;
  } catch (error) {
    console.error('Failed to check company ownership:', error);
    return false;
  }
}