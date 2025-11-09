'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChatPanel } from '@/components/claims/chat-panel'
import { OrchestratorPanel } from '@/components/claims/orchestrator-panel'
import { ClaimProgressFlow } from '@/components/claims/claim-progress-flow'
import { FileExtractionDisplay } from '@/components/claims/file-extraction-display'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Claim } from '@/types/claim'
import { ArrowLeft, FileText, Calendar, MapPin, Car, Shield } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function ClaimDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const claimId = params.id as string

  const [claim, setClaim] = useState<Claim | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [estimatedPayout, setEstimatedPayout] = useState<number | undefined>(undefined)
  const [nextActions, setNextActions] = useState<string[]>([
    'Run FinTrack agent to estimate damage costs',
    'Get repair shop recommendations',
    'Generate formal claim document'
  ])

  useEffect(() => {
    if (claimId) {
      fetchClaimData()
    }
  }, [claimId])

  const fetchClaimData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/claims/${claimId}`)
      if (!response.ok) throw new Error('Failed to fetch claim')

      const data = await response.json()

      // Transform backend data to frontend Claim type
      const transformedClaim: Claim = {
        claim_id: data.claim_id,
        status: data.status,
        incident_data: {
          date: data.date || data.incident_data?.date || '',
          time: data.incident_data?.time || '00:00',
          location: data.location || data.incident_data?.location || '',
          type: data.incident_type || data.incident_data?.type || 'other',
          description: data.summary || data.incident_data?.description || '',
        },
        vehicle_data: data.vehicle_data || {
          year: 2024,
          make: 'Unknown',
          model: 'Unknown',
          license_plate: 'N/A',
        },
        insurance_data: data.insurance_data || {
          provider: 'Unknown',
          policy_number: 'N/A',
          coverage_type: 'comprehensive',
          deductible: 0,
        },
        damage_data: {
          description: data.damages_description || data.damage_data?.description || '',
          severity: data.damage_data?.severity || 'moderate',
          photos_uploaded: data.damage_data?.photos_uploaded || false,
        },
        police_report: data.police_report,
        orchestrator_state: data.orchestrator_state || {},
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      }

      setClaim(transformedClaim)
    } catch (error) {
      console.error('Error fetching claim:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgentTrigger = async (agentType: string) => {
    console.log('Triggering agent:', agentType)
    // Agent will be triggered by the OrchestratorPanel component
    // After completion, refresh claim data
    setTimeout(() => {
      fetchClaimData()
    }, 2000)
  }

  const handleClaimUpdate = async (updates: any) => {
    console.log('Updating claim:', updates)
    try {
      const response = await fetch(`http://localhost:8000/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (response.ok) {
        fetchClaimData()
      }
    } catch (error) {
      console.error('Error updating claim:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading claim details...</p>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Not Found</h2>
          <p className="text-gray-600 mb-4">The claim you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary'
      case 'processing':
        return 'warning'
      case 'review':
        return 'info'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Minimal Professional Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  {claim.incident_data.type}
                </h1>
                <p className="text-xs text-gray-500">Claim #{claim.claim_id}</p>
              </div>
              <Badge
                variant={getStatusColor(claim.status) as any}
                className="text-xs"
              >
                {claim.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Submit Claim
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Main Claim Details */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
            {/* Processing Status - AT THE TOP */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Processing Status
              </h2>
              <ClaimProgressFlow
                currentStep={currentStep}
                estimatedPayout={estimatedPayout}
                nextActions={nextActions}
              />
            </div>

            {/* Key Info Grid - COLORFUL */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 backdrop-blur">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/90 font-semibold">📅 Incident Date</p>
                    <p className="text-base font-bold text-white">
                      {formatDate(claim.incident_data.date)}
                    </p>
                    <p className="text-xs text-white/80">{claim.incident_data.time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 backdrop-blur">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/90 font-semibold">📍 Location</p>
                    <p className="text-sm font-bold text-white">
                      {claim.incident_data.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 backdrop-blur">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/90 font-semibold">🚗 Vehicle</p>
                    <p className="text-sm font-bold text-white">
                      {claim.vehicle_data.year} {claim.vehicle_data.make} {claim.vehicle_data.model}
                    </p>
                    <p className="text-xs text-white/80">
                      {claim.vehicle_data.license_plate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 backdrop-blur">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/90 font-semibold">🛡️ Insurance</p>
                    <p className="text-sm font-bold text-white">
                      {claim.insurance_data.provider}
                    </p>
                    <p className="text-xs text-white/80">
                      ${claim.insurance_data.deductible} deductible
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Description - COLORFUL */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-2xl p-6 shadow-lg">
              <h2 className="text-base font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span> Incident Description
              </h2>
              <p className="text-sm text-indigo-900 leading-relaxed">
                {claim.incident_data.description}
              </p>
            </div>

            {/* Damage Details - COLORFUL */}
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-orange-900 flex items-center gap-2">
                  <span className="text-xl">⚠️</span> Damage Assessment
                </h2>
                <Badge
                  variant={
                    claim.damage_data.severity === 'severe'
                      ? 'destructive'
                      : claim.damage_data.severity === 'moderate'
                      ? 'warning'
                      : 'secondary'
                  }
                  className="text-xs font-bold"
                >
                  {claim.damage_data.severity}
                </Badge>
              </div>
              <p className="text-sm text-orange-900 leading-relaxed">
                {claim.damage_data.description}
              </p>
            </div>

            {/* Police Report - COLORFUL */}
            {claim.police_report?.filed && (
              <div className="bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
                <h2 className="text-base font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🚨</span> Police Report
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-red-700 font-semibold">Report Number</p>
                    <p className="text-sm font-bold text-red-900">
                      {claim.police_report.report_number}
                    </p>
                  </div>
                  {claim.police_report.officer_name && (
                    <div>
                      <p className="text-xs text-red-700 font-semibold">Officer</p>
                      <p className="text-sm font-bold text-red-900">
                        {claim.police_report.officer_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents - COLORFUL */}
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300 rounded-2xl p-6 shadow-lg">
              <h2 className="text-base font-bold text-cyan-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📄</span> Documents & AI Analysis
              </h2>
              <FileExtractionDisplay
                files={[
                  {
                    name: 'accident-report.pdf',
                    size: 245760,
                    uploadedAt: 'Today at 2:45 PM'
                  }
                ]}
                extractedData={[
                  { field: 'Incident Date', value: claim.incident_data.date, confidence: 95 },
                  { field: 'Location', value: claim.incident_data.location, confidence: 92 },
                  { field: 'Vehicle Make', value: claim.vehicle_data.make, confidence: 98 },
                  { field: 'Vehicle Model', value: claim.vehicle_data.model, confidence: 98 },
                  { field: 'License Plate', value: claim.vehicle_data.license_plate, confidence: 89 },
                  { field: 'Damage Severity', value: claim.damage_data.severity, confidence: 85 }
                ]}
                processingStatus="complete"
              />
            </div>
          </div>
        </div>

        {/* Right: Resizable AI Assistant Panel */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <div className="border-b border-gray-200 bg-white px-4 py-3">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="chat" className="text-xs">
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="orchestrator" className="text-xs">
                  Agents
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 m-0 p-0 overflow-hidden">
              <div className="h-full">
                <ChatPanel
                  claim={claim}
                  onAgentTrigger={handleAgentTrigger}
                  onClaimUpdate={handleClaimUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="orchestrator" className="flex-1 m-0 p-0 overflow-hidden">
              <div className="h-full">
                <OrchestratorPanel
                  claim={claim}
                  onAgentComplete={(agentType, output) => {
                    console.log('Agent completed:', agentType, output)
                    fetchClaimData()
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
