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
    // For now, everyone is admin (we'll add real auth later)
    const userId = 'demo-user';
    const accessLevel: AccessLevel = 'admin';

    if (requiredAccess === 'admin' && accessLevel !== 'admin') {
      throw new Error('Admin access required');
    }

    return { userId, accessLevel };
  }
);