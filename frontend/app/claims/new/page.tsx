'use client'

import { ClaimForm } from '@/components/claims/claim-form'
import { useRouter } from 'next/navigation'

export default function NewClaimPage() {
  const router = useRouter()

  const handleComplete = (claimId: string) => {
    // Redirect to the newly created claim
    router.push(`/claim/${claimId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8">
      <ClaimForm onComplete={handleComplete} />
    </div>
  )
}
