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
          date: data.date || data.incident_data?.date || '2025-11-08',
          time: data.incident_data?.time || '09:42',
          location: data.location || data.incident_data?.location || '675 Nassau St, Princeton, NJ',
          type: data.incident_type || data.incident_data?.type || 'rear-end collision',
          description: data.summary || data.incident_data?.description || 'While stopped at a red light near Princeton Junction, another vehicle failed to brake in time and rear-ended my car.',
        },
        vehicle_data: data.vehicle_data || {
          year: 2022,
          make: 'Honda',
          model: 'Accord EX-L',
          license_plate: 'NJC-4927',
        },
        insurance_data: data.insurance_data || {
          provider: 'State Farm',
          policy_number: 'SF-2025-PRNJ-001',
          coverage_type: 'comprehensive',
          deductible: 500,
        },
        damage_data: {
          description: data.damages_description || data.damage_data?.description || 'Rear bumper cracked, trunk slightly misaligned, rear sensors malfunctioning. Taillight on driver side partially damaged.',
          severity: data.damage_data?.severity || 'moderate',
          photos_uploaded: data.damage_data?.photos_uploaded || true,
        },
        police_report: data.police_report || {
          filed: true,
          report_number: 'NJPR-5574-110825',
          officer_name: 'Officer Daniel Ruiz',
        },
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
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Claim {
  claim_id: string;
  incident_type: string;
  date: string;
  location: string;
  status: string;
  summary: string;
  estimated_damage?: string;
  damages_description: string;
}

interface AgentStatus {
  ClaimPilot: string;
  FinTrack: string;
  ClaimDrafting: string;
  ComplianceCheck: string;
}

export default function ClaimDetailsPage() {
  const params = useParams();
  const claimId = params.id as string;

  const [claim, setClaim] = useState<Claim | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (claimId) {
      fetchClaimData();
      fetchAgentStatus();
    }
  }, [claimId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchClaimData = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/claims/${claimId}`);
      const data = await response.json();
      setClaim(data);

      // Add initial greeting
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm ClaimPilot, your AI assistant. I see you're working on claim ${claimId}. How can I help you today?`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error fetching claim:', error);
    }
  };

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/claims/${claimId}/agent-status`);
      const data = await response.json();
      setAgentStatus(data.agent_status);
    } catch (error) {
      console.error('Error fetching agent status:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:9000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          claim_id: claimId
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Refresh agent status
      fetchAgentStatus();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return '✅';
      case 'In Progress':
        return '⏳';
      case 'Error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
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
                <h1 className="text-base font-bold text-gray-900">
                  {claim.incident_data.type}
                </h1>
                <p className="text-xs text-gray-700 font-medium">Claim #{claim.claim_id}</p>
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
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{claim.incident_type}</h1>
                <p className="text-sm text-gray-500">Claim #{claim.claim_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {claim.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Main Claim Details */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
            {/* Processing Status - AT THE TOP */}
            <ClaimProgressFlow
              currentStep={currentStep}
              estimatedPayout={estimatedPayout}
              nextActions={nextActions}
            />

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-bold">Incident Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(claim.incident_data.date)}
                    </p>
                    <p className="text-xs text-gray-900 font-medium">{claim.incident_data.time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-bold">Location</p>
                    <p className="text-sm font-bold text-gray-900">
                      {claim.incident_data.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100">
                    <Car className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-bold">Vehicle</p>
                    <p className="text-sm font-bold text-gray-900">
                      {claim.vehicle_data.year} {claim.vehicle_data.make} {claim.vehicle_data.model}
                    </p>
                    <p className="text-xs text-gray-900 font-medium">
                      {claim.vehicle_data.license_plate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-bold">Insurance</p>
                    <p className="text-sm font-bold text-gray-900">
                      {claim.insurance_data.provider}
                    </p>
                    <p className="text-xs text-gray-900 font-medium">
                      ${claim.insurance_data.deductible} deductible
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Description */}
            <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📝</span> Incident Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {claim.incident_data.description}
              </p>
            </div>

            {/* Damage Details */}
            <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Damage Assessment
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
              <p className="text-sm text-gray-700 leading-relaxed">
                {claim.damage_data.description}
              </p>
            </div>

            {/* Police Report */}
            {claim.police_report?.filed && (
              <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🚨</span> Police Report
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Report Number</p>
                    <p className="text-sm font-bold text-gray-900">
                      {claim.police_report.report_number}
                    </p>
                  </div>
                  {claim.police_report.officer_name && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Officer</p>
                      <p className="text-sm font-bold text-gray-900">
                        {claim.police_report.officer_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white border border-cyan-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📄</span> Documents & AI Analysis
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
      {/* Main Content - Dual Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Claim Info & Agent Status */}
        <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Claim Metadata */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">DATE</p>
                  <p className="text-sm text-gray-900">{claim.date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">LOCATION</p>
                  <p className="text-sm text-gray-900">{claim.location}</p>
                </div>
                {claim.estimated_damage && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">ESTIMATED DAMAGE</p>
                    <p className="text-lg font-bold text-gray-900">{claim.estimated_damage}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500">DESCRIPTION</p>
                  <p className="text-sm text-gray-900">{claim.damages_description}</p>
                </div>
              </div>
            </div>

            {/* AI Agent Collaboration */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Collaboration</h2>
              {agentStatus && (
                <div className="space-y-3">
                  {/* ClaimPilot */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.ClaimPilot)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">ClaimPilot (Core)</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.ClaimPilot)}`}>
                          {agentStatus.ClaimPilot}
                        </span>
                      </div>
                      {agentStatus.ClaimPilot === 'Complete' && claim.estimated_damage && (
                        <p className="text-sm text-gray-600">Damage: {claim.estimated_damage}</p>
                      )}
                    </div>
                  </div>

                  {/* FinTrack */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.FinTrack)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">FinTrack</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.FinTrack)}`}>
                          {agentStatus.FinTrack}
                        </span>
                      </div>
                      {agentStatus.FinTrack === 'Complete' && (
                        <p className="text-sm text-gray-600">Financial analysis ready</p>
                      )}
                    </div>
                  </div>

                  {/* Claim Drafting */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.ClaimDrafting)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Claim Drafting</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.ClaimDrafting)}`}>
                          {agentStatus.ClaimDrafting}
                        </span>
                      </div>
                      {agentStatus.ClaimDrafting === 'Complete' && (
                        <p className="text-sm text-gray-600">Draft document ready</p>
                      )}
                    </div>
                  </div>

                  {/* Compliance Check */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAgentStatusIcon(agentStatus.ComplianceCheck)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Compliance Check</p>
                        <span className={`text-xs font-medium ${getAgentStatusColor(agentStatus.ComplianceCheck)}`}>
                          {agentStatus.ComplianceCheck}
                        </span>
                      </div>
                      {agentStatus.ComplianceCheck === 'Complete' && (
                        <p className="text-sm text-gray-600">Validation complete</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Claim Status Timeline */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Claim Status</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="h-full w-px bg-gray-300"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">Claim Submitted</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {agentStatus?.ClaimPilot === 'Complete' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="h-full w-px bg-gray-300"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">Document Processed</p>
                      <p className="text-xs text-gray-500">AI extraction complete</p>
                    </div>
                  </div>
                )}

                {agentStatus?.FinTrack === 'Complete' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="h-full w-px bg-gray-300"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">Damage Assessed</p>
                      <p className="text-xs text-gray-500">{claim.estimated_damage || 'Calculating...'}</p>
                    </div>
                  </div>
                )}

                {agentStatus?.ComplianceCheck === 'Complete' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Compliance Verified</p>
                      <p className="text-xs text-gray-500">Ready for submission</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Chat Interface */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                CP
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">ClaimPilot Chat Assistant</h2>
                <p className="text-xs text-gray-500">Ask me anything about your claim</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4 max-w-3xl">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
