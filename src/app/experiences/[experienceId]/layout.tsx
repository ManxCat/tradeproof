import { dehydrate } from '@tanstack/react-query'
import { WhopProvider } from '~/components/whop-context'
import { serverQueryClient } from '~/components/whop-context/whop-queries'

async function fetchExperience(experienceId: string) {
  const apiKey = process.env.WHOP_API_KEY
  if (!apiKey) throw new Error('Missing WHOP_API_KEY')

  const response = await fetch(`https://api.whop.com/api/v5/experiences/${experienceId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
    cache: 'no-store',
  })
  
  if (!response.ok) throw new Error('Failed to fetch experience')
  return response.json()
}

export default async function ExperienceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ experienceId: string }>
}) {
  const { experienceId } = await params

  // Fetch and prefill the cache server-side
  const experience = await fetchExperience(experienceId)
  
  // Manually set the query data in the server query client
  serverQueryClient.setQueryData(['experience', experienceId], experience)
  
  // Set default user data (we'll handle auth later)
  serverQueryClient.setQueryData(['user', experienceId], {
    user: null,
    access: 'member' as const,
  })

  return (
    <WhopProvider state={dehydrate(serverQueryClient)} experienceId={experienceId}>
      {children}
    </WhopProvider>
  )
}