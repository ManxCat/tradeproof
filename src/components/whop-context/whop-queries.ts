import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { env } from '~/env'
import type { WhopExperience, WhopExperienceAccess, WhopUser } from './whop-context'

export const serverQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
    },
  },
})

// These are for client-side only now
export const whopExperienceQuery = (experienceId: string) => ({
  queryKey: ['experience', experienceId],
  queryFn: async () => {
    // Client-side can't fetch directly from Whop
    // This will be populated from server-side initial data
    throw new Error('Should use initial data from server')
  },
})

export const whopUserQuery = (experienceId: string) => ({
  queryKey: ['user', experienceId],
  queryFn: async () => {
    throw new Error('Should use initial data from server')
  },
})