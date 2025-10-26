'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type WhopUser = {
  id: string;
  username?: string;
  email?: string;
} | null;

const WhopUserContext = createContext<WhopUser>(null);

export function WhopClientProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WhopUser>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Try to get user from URL params (Whop sometimes passes it)
    const userParam = searchParams.get('user');
    const userIdParam = searchParams.get('userId');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user param:', e);
      }
    } else if (userIdParam) {
      setUser({ id: userIdParam });
    }
    
    // Also listen for postMessage from Whop parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'whop:user') {
        setUser(event.data.user);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchParams]);
  
  return (
    <WhopUserContext.Provider value={user}>
      {children}
    </WhopUserContext.Provider>
  );
}

export function useWhopUser() {
  return useContext(WhopUserContext);
}