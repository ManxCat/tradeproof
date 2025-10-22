import { redirect } from 'next/navigation';

export default function HomePage() {
  // This is a Whop app - redirect to a default experience or show info
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">TradeProof</h1>
        <p className="text-gray-400 mb-8">This app is designed to run within Whop.</p>
        <p className="text-sm text-gray-500">
          Please access this app through your Whop experience.
        </p>
      </div>
    </div>
  );
}