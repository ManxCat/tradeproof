// Helper functions for Whop API calls

const WHOP_API_BASE = 'https://api.whop.com/api/v2';

export async function cancelWhopMembership(membershipId: string) {
  const response = await fetch(`${WHOP_API_BASE}/memberships/${membershipId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to cancel membership: ${error.message || response.statusText}`);
  }

  return await response.json();
}

export async function getMembership(membershipId: string) {
  const response = await fetch(`${WHOP_API_BASE}/memberships/${membershipId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch membership');
  }

  return await response.json();
}