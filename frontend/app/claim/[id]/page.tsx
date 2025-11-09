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
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {claim.incident_data.type}
                  </h1>
                  <Badge variant={getStatusColor(claim.status) as any}>
                    {claim.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">Claim #{claim.claim_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button variant="gradient" size="sm">
                Submit Claim
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Claim Info Sidebar */}
        <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Claim Information
              </h3>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Incident Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(claim.incident_data.date)}
                      </p>
                      <p className="text-xs text-gray-600">{claim.incident_data.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claim.incident_data.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Car className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Vehicle</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claim.vehicle_data.year} {claim.vehicle_data.make}{' '}
                        {claim.vehicle_data.model}
                      </p>
                      <p className="text-xs text-gray-600">
                        Plate: {claim.vehicle_data.license_plate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Insurance</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claim.insurance_data.provider}
                      </p>
                      <p className="text-xs text-gray-600">
                        Policy: {claim.insurance_data.policy_number}
                      </p>
                      <p className="text-xs text-gray-600">
                        Deductible: {formatCurrency(claim.insurance_data.deductible)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Incident Description
              </h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {claim.incident_data.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Damage Details
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Severity</span>
                    <Badge
                      variant={
                        claim.damage_data.severity === 'severe'
                          ? 'destructive'
                          : claim.damage_data.severity === 'moderate'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {claim.damage_data.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">
                    {claim.damage_data.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {claim.police_report?.filed && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Police Report
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Report Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claim.police_report.report_number}
                      </p>
                    </div>
                    {claim.police_report.officer_name && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Officer</p>
                        <p className="text-sm font-medium text-gray-900">
                          {claim.police_report.officer_name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Claim Progress Flow */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Processing Status
              </h3>
              <ClaimProgressFlow
                currentStep={currentStep}
                estimatedPayout={estimatedPayout}
                nextActions={nextActions}
              />
            </div>

            {/* File Extraction Display */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Documents & AI Extraction
              </h3>
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

        {/* Main Panel - Chat & Orchestrator Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <div className="border-b border-gray-200 bg-white px-6">
              <TabsList className="h-12">
                <TabsTrigger value="chat" className="px-6">
                  Chat Assistant
                </TabsTrigger>
                <TabsTrigger value="orchestrator" className="px-6">
                  Agent Orchestrator
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
