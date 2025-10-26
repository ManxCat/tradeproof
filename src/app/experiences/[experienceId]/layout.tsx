import { dehydrate } from '@tanstack/react-query'
import { WhopProvider } from '~/components/whop-context'
import { serverQueryClient } from '~/components/whop-context/whop-queries'

async function fetchExperience(experienceId: string) {
  const apiKey = process.env.WHOP_API_KEY
  
  console.log('WHOP_API_KEY exists:', !!apiKey)
  console.log('Fetching experience:', experienceId)
  
  if (!apiKey) throw new Error('Missing WHOP_API_KEY')

  const response = await fetch(`https://api.whop.com/api/v5/experiences/${experienceId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
    cache: 'no-store',
  })
  
  console.log('Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Whop API error:', errorText)
    throw new Error(`Failed to fetch experience: ${response.status} - ${errorText}`)
  }
  
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

  try {
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
  } catch (error) {
    console.error('Layout error:', error)
    throw error
  }
}