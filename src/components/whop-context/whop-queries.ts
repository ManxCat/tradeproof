import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { env } from '~/env'
import type { WhopExperience, WhopExperienceAccess, WhopUser } from './whop-context'

export const serverQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
    },
  },
})

export const whopExperienceQuery = (experienceId: string) => ({
  queryKey: ['experience', experienceId],
  queryFn: async () => {
    // Fetch directly from Whop API server-side
    const apiKey = process.env.WHOP_API_KEY
    if (!apiKey) throw new Error('Missing WHOP_API_KEY')

    const response = await fetch(`https://api.whop.com/api/v5/experiences/${experienceId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    if (!response.ok) throw new Error('Failed to fetch whop experience')
    return response.json() as Promise<WhopExperience>
  },
})

export const whopUserQuery = (experienceId: string) => ({
  queryKey: ['user', experienceId],
  queryFn: async () => {
    // Get user token from request headers
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const userToken = authHeader?.replace('Bearer ', '')
    
    if (!userToken) throw new Error('No user token provided')

    // Fetch user from Whop API
    const response = await fetch('https://api.whop.com/api/v5/me', {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    })
    
    if (!response.ok) throw new Error('Failed to fetch whop user')
    const user = await response.json() as WhopUser
    
    // TODO: Determine access level based on user's memberships
    // For now, default to 'member'
    const access: WhopExperienceAccess = 'member'
    
    return { user, access }
  },
})