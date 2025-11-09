'use client'

import * as React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileSearch,
  DollarSign,
  Wrench,
  FileText,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Agent, AgentStatus } from '@/types/agent'

interface AgentCardProps {
  agent: Agent
  onRun: () => Promise<void>
  disabled?: boolean
}

const AGENT_ICONS: Record<string, React.ElementType> = {
  core_agent: FileSearch,
  fintrack: DollarSign,
  repair_advisor: Wrench,
  drafting: FileText,
  compliance: CheckCircle,
}

const STATUS_STYLES: Record<AgentStatus, { badge: string; color: string }> = {
  idle: { badge: 'Idle', color: 'secondary' },
  running: { badge: 'Running', color: 'warning' },
  complete: { badge: 'Complete', color: 'success' },
  error: { badge: 'Error', color: 'destructive' },
}

const DEMO_DATA: Record<string, any> = {
  core_agent: {
    extracted_fields: 18,
    confidence: 'high',
    incident_date: '11/08/2025',
    incident_time: '09:42 AM',
    location: '675 Nassau St, Princeton, NJ',
    vehicle: '2022 Honda Accord EX-L',
    license_plate: 'NJC-4927',
    vin: '1HGCV1F59NA012345',
    driver_name: 'John Smith',
    insurance_provider: 'State Farm',
    policy_number: 'SF-2025-PRNJ-001',
    police_report_number: 'NJPR-5574-110825',
    officer_name: 'Officer Daniel Ruiz',
    at_fault: 'Other driver',
    police_determination: 'Other driver failed to brake, rear-ended claimant at red light. Claimant determined NOT at fault.',
    incident_summary: 'Vehicle was stopped at red light when struck from behind by another vehicle. Impact caused rear-end damage. No injuries reported at scene. Other driver cited for following too closely.',
    damage_type: 'Rear-end collision damage',
    damage_severity: 'Moderate',
    witness_present: 'Yes - Sarah Lopez (609) 555-2189',
  },
  fintrack: {
    damage_total: 4250,
    deductible: 500,
    payout: 3750,
    confidence: 'high',
    shops: [
      { name: 'Princeton Auto Body', address: '123 Main St', rating: 4.8, price_estimate: 3900, turnaround_days: 5, distance_miles: 1.2 },
      { name: 'Elite Collision Center', address: '456 Oak Ave', rating: 4.9, price_estimate: 4100, turnaround_days: 4, distance_miles: 2.5 },
      { name: 'NJ Certified Repairs', address: '789 Elm St', rating: 4.7, price_estimate: 3850, turnaround_days: 6, distance_miles: 3.1 },
    ]
  },
  drafting: {
    pdf_url: '#',
    pages: 8,
    sections: ['Incident Details', 'Damage Assessment', 'Cost Breakdown', 'Legal Compliance', 'Supporting Evidence'],
  },
}

export function AgentCard({ agent, onRun, disabled }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [demoOutput, setDemoOutput] = useState<any>(null)

  const Icon = AGENT_ICONS[agent.id] || FileSearch
  const statusStyle = STATUS_STYLES[agent.status]
  const displayOutput = demoOutput || agent.output

  const handleRunDemo = () => {
    setDemoOutput(DEMO_DATA[agent.id] || { message: 'Demo data generated successfully!' })
    setIsExpanded(true)
  }

  const handleRun = async () => {
    setIsRunning(true)
    try {
      await onRun()
    } finally {
      setIsRunning(false)
    }
  }

  const canRun = () => {
    if (disabled || isRunning) return false
    if (agent.dependencies && agent.dependencies.length > 0) {
      // Check if dependencies are met (you'd need to pass this info from parent)
      // For now, we'll allow running
      return true
    }
    return true
  }

  const renderOutput = () => {
    if (!displayOutput) return null

    // Different rendering based on agent type
    switch (agent.id) {
      case 'fintrack':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
              <p className="text-xs uppercase font-semibold opacity-90">Estimated Payout</p>
              <p className="text-3xl font-bold">${displayOutput.payout?.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">Damage: ${displayOutput.damage_total} - Deductible: ${displayOutput.deductible}</p>
            </div>

            {displayOutput.shops && (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">🔧 Top Repair Shops</p>
                <div className="space-y-2">
                  {displayOutput.shops.slice(0, 3).map((shop: any, index: number) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{shop.name}</h4>
                          <p className="text-xs text-gray-600">{shop.address}</p>
                        </div>
                        <Badge className="bg-amber-500 text-white">⭐ {shop.rating}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-gray-500">Price</span>
                          <p className="font-bold text-green-600">${shop.price_estimate}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time</span>
                          <p className="font-bold text-gray-900">{shop.turnaround_days}d</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Distance</span>
                          <p className="font-bold text-blue-600">{shop.distance_miles}mi</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'core_agent':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-bold text-blue-900">✓ Successfully Extracted All Data</p>
              <p className="text-xs text-blue-700 mt-1">{displayOutput.extracted_fields} key fields identified with high confidence</p>
            </div>

            {/* Fault Determination */}
            {displayOutput.at_fault && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                <p className="text-xs font-bold text-green-900 mb-1">⚖️ Fault Determination</p>
                <p className="text-xs text-green-800 font-bold">{displayOutput.at_fault} at fault</p>
                {displayOutput.police_determination && (
                  <p className="text-xs text-green-700 mt-2">{displayOutput.police_determination}</p>
                )}
              </div>
            )}

            {/* What Happened */}
            {displayOutput.incident_summary && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-900 mb-1">📋 What Happened</p>
                <p className="text-xs text-gray-800 leading-relaxed">{displayOutput.incident_summary}</p>
              </div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white border rounded p-2">
                <p className="text-gray-600 font-medium">Date & Time</p>
                <p className="font-bold text-gray-900">{displayOutput.incident_date}</p>
                <p className="text-gray-700">{displayOutput.incident_time}</p>
              </div>
              <div className="bg-white border rounded p-2">
                <p className="text-gray-600 font-medium">Location</p>
                <p className="font-bold text-gray-900 text-[10px] leading-tight">{displayOutput.location}</p>
              </div>
              <div className="bg-white border rounded p-2">
                <p className="text-gray-600 font-medium">Driver</p>
                <p className="font-bold text-gray-900">{displayOutput.driver_name}</p>
              </div>
              <div className="bg-white border rounded p-2">
                <p className="text-gray-600 font-medium">Police Report</p>
                <p className="font-bold text-gray-900 text-[10px]">{displayOutput.police_report_number}</p>
              </div>
              <div className="bg-white border rounded p-2">
                <p className="text-gray-600 font-medium">Vehicle</p>
                <p className="font-bold text-gray-900">{displayOutput.vehicle}</p>
                <p className="text-gray-700 text-[10px]">{displayOutput.license_plate}</p>
              </div>
              <div className="bg-white border rounded p-2">
                <p className="text-gray-600 font-medium">Insurance</p>
                <p className="font-bold text-gray-900">{displayOutput.insurance_provider}</p>
                <p className="text-gray-700 text-[10px]">{displayOutput.policy_number}</p>
              </div>
              <div className="bg-white border rounded p-2 col-span-2">
                <p className="text-gray-600 font-medium">Damage Assessment</p>
                <p className="font-bold text-gray-900">{displayOutput.damage_severity} - {displayOutput.damage_type}</p>
              </div>
              {displayOutput.witness_present && (
                <div className="bg-white border rounded p-2 col-span-2">
                  <p className="text-gray-600 font-medium">Witness</p>
                  <p className="font-bold text-gray-900 text-[10px]">{displayOutput.witness_present}</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'drafting':
        return (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-bold text-green-900">✓ Professional Claim Document Generated</p>
              <p className="text-xs text-green-700 mt-1">{displayOutput.pages} pages • Ready for submission</p>
            </div>
            {displayOutput.sections && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Included Sections:</p>
                <div className="space-y-1">
                  {displayOutput.sections.map((section: string, i: number) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button size="sm" variant="outline" className="w-full" asChild>
              <a href={displayOutput.pdf_url || '#'} download>
                📄 Download Claim PDF
              </a>
            </Button>
          </div>
        )

      default:
        return (
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(displayOutput, null, 2)}
          </pre>
        )
    }
  }

  return (
    <Card className={agent.status === 'complete' ? 'border-green-200' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                agent.status === 'complete'
                  ? 'bg-green-100'
                  : agent.status === 'running'
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  agent.status === 'complete'
                    ? 'text-green-600'
                    : agent.status === 'running'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{agent.name}</CardTitle>
              <CardDescription className="text-xs text-gray-600 mt-1">{agent.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusStyle.color as any}>{statusStyle.badge}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Dependencies Warning */}
          {agent.dependencies && agent.dependencies.length > 0 && (
            <div className="text-xs text-gray-700 font-medium bg-gray-50 p-2 rounded border border-gray-200">
              Requires: {agent.dependencies.join(', ')}
            </div>
          )}

          {/* Run Button */}
          <Button
            onClick={handleRun}
            disabled={!canRun()}
            variant={agent.status === 'complete' ? 'outline' : 'gradient'}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : agent.status === 'complete' ? (
              'Re-run Agent'
            ) : (
              'Run Agent'
            )}
          </Button>

          {/* Demo Button */}
          <Button
            onClick={handleRunDemo}
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
          >
            ✨ Show Demo Example
          </Button>

          {/* Error Display */}
          {agent.status === 'error' && agent.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              <strong>Error:</strong> {agent.error}
            </div>
          )}

          {/* Output Section */}
          {(agent.status === 'complete' && agent.output) || displayOutput ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-between"
              >
                <span className="font-medium">{demoOutput ? 'View Demo Output' : 'View Output'}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {isExpanded && (
                <div className="mt-3 border-t pt-3">
                  {renderOutput()}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
