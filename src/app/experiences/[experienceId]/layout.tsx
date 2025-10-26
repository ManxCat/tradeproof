import { WhopProvider } from '~/components/whop-context'

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

async function fetchUser(userToken: string) {
  const response = await fetch('https://api.whop.com/api/v5/me', {
    headers: { 'Authorization': `Bearer ${userToken}` },
    cache: 'no-store',
  })
  
  if (!response.ok) throw new Error('Failed to fetch user')
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

  // Fetch data server-side
  const experience = await fetchExperience(experienceId)
  
  // For now, pass null for user - we'll handle auth differently
  const initialData = {
    experience,
    user: null,
  }

  return (
    <WhopProvider initialData={initialData} experienceId={experienceId}>
      {children}
    </WhopProvider>
  )
}