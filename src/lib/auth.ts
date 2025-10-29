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
      
      // Check if user is the experience owner
      const isAdmin = await isExperienceOwner(userId, experienceId);
      
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

// Check if user owns the experience
async function isExperienceOwner(userId: string, experienceId: string): Promise<boolean> {
  try {
    // Fetch the experience details
    const experience = await whopSdk.experiences.getExperience({ id: experienceId });
    
    console.log('Experience data:', experience);
    
    // Try different possible owner field names
    const ownerId = (experience as any).ownerId || 
                    (experience as any).owner_id || 
                    (experience as any).created_by ||
                    (experience as any).userId;
    
    console.log('Experience owner check:', {
      userId,
      ownerId,
      isOwner: ownerId === userId
    });
    
    return ownerId === userId;
  } catch (error) {
    console.error('Failed to check experience ownership:', error);
    // If we can't verify, assume they're not admin (safe default)
    return false;
  }
}