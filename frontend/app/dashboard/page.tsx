'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, ChevronRight, FileText } from 'lucide-react'

interface Claim {
  claim_id: string
  incident_type: string
  date: string
  location: string
  status: string
  summary: string
  estimated_damage?: string
  updated_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/claims')
      const data = await response.json()
      setClaims(data.claims || [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary'
      case 'processing':
        return 'warning'
      case 'open':
        return 'info'
      case 'review':
        return 'warning'
      case 'approved':
        return 'success'
      case 'closed':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const groupedClaims = {
    inProgress: claims.filter(
      (c) =>
        c.status.toLowerCase() === 'processing' ||
        c.status.toLowerCase() === 'open' ||
        c.status.toLowerCase() === 'draft' ||
        c.status.toLowerCase() === 'review'
    ),
    completed: claims.filter((c) => c.status.toLowerCase() === 'closed'),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ClaimPilot</h1>
                <p className="text-xs text-gray-500">AI-Powered Claims Assistant</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-2 text-gray-600">Manage and track your insurance claims</p>
        </div>

        {/* New Claim Button */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/claims/new')}
            variant="gradient"
            size="lg"
            className="shadow-lg hover:shadow-xl"
          >
            <Plus className="mr-2 h-5 w-5" />
            Start New Claim
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading claims...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* In Progress Claims */}
            {groupedClaims.inProgress.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">In Progress</h2>
                <div className="grid gap-4">
                  {groupedClaims.inProgress.map((claim) => (
                    <Link key={claim.claim_id} href={`/claim/${claim.claim_id}`}>
                      <Card className="p-6 hover:shadow-xl transition-all border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {claim.incident_type}
                              </h3>
                              <Badge variant={getStatusColor(claim.status) as any}>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{claim.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{claim.date}</span>
                              <span>•</span>
                              <span>{claim.location}</span>
                              {claim.estimated_damage && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-green-600">
                                    {claim.estimated_damage}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Claims */}
            {groupedClaims.completed.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed</h2>
                <div className="grid gap-4">
                  {groupedClaims.completed.map((claim) => (
                    <Link key={claim.claim_id} href={`/claim/${claim.claim_id}`}>
                      <Card className="p-6 hover:shadow-lg transition-all border-gray-200 opacity-75 hover:opacity-100 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {claim.incident_type}
                              </h3>
                              <Badge variant={getStatusColor(claim.status) as any}>
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{claim.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{claim.date}</span>
                              <span>•</span>
                              <span>{claim.location}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {claims.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No claims yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first insurance claim. Our AI will guide you through
                  the process step by step.
                </p>
                <Button
                  onClick={() => router.push('/claims/new')}
                  variant="gradient"
                  size="lg"
                  className="shadow-lg hover:shadow-xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Claim
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
