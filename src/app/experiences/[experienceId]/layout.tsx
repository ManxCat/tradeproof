import { dehydrate } from '@tanstack/react-query'
import { WhopProvider } from '~/components/whop-context'
import { serverQueryClient } from '~/components/whop-context/whop-queries'

export default async function ExperienceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ experienceId: string }>
}) {
  const { experienceId } = await params

  // Set mock data - we don't actually need real Whop data
  serverQueryClient.setQueryData(['experience', experienceId], {
    id: experienceId,
    name: 'TradeProof',
  })
  
  serverQueryClient.setQueryData(['user', experienceId], {
    user: { id: 'demo', username: 'demo' },
    access: 'member' as const,
  })

  return (
    <WhopProvider state={dehydrate(serverQueryClient)} experienceId={experienceId}>
      {children}
    </WhopProvider>
  )
}