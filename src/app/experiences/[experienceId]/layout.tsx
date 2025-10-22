import { dehydrate } from '@tanstack/react-query'
import { WhopProvider } from '~/components/whop-context'
import {
  serverQueryClient,
  whopExperienceQuery,
  whopUserQuery,
} from '~/components/whop-context/whop-queries'

export default async function ExperienceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ experienceId: string }>
}) {
  const { experienceId } = await params

  serverQueryClient.prefetchQuery(whopExperienceQuery(experienceId))
  serverQueryClient.prefetchQuery(whopUserQuery(experienceId))

  return (
    <WhopProvider state={dehydrate(serverQueryClient)} experienceId={experienceId}>
      {children}
    </WhopProvider>
  )
}