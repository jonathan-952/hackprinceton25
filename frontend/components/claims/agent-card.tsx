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

export function AgentCard({ agent, onRun, disabled }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const Icon = AGENT_ICONS[agent.id] || FileSearch
  const statusStyle = STATUS_STYLES[agent.status]

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
    if (!agent.output) return null

    // Different rendering based on agent type
    switch (agent.id) {
      case 'fintrack':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Damage Total:</div>
              <div>${agent.output.damage_total?.toLocaleString() || '—'}</div>
              <div className="font-medium">Deductible:</div>
              <div>${agent.output.deductible?.toLocaleString() || '—'}</div>
              <div className="font-medium text-green-600">Payout:</div>
              <div className="font-bold text-green-600">
                ${agent.output.payout?.toLocaleString() || '—'}
              </div>
              <div className="font-medium">Confidence:</div>
              <div>
                <Badge variant={agent.output.confidence === 'high' ? 'success' : 'warning'}>
                  {agent.output.confidence || 'medium'}
                </Badge>
              </div>
            </div>
          </div>
        )

      case 'repair_advisor':
        return (
          <div className="space-y-3">
            {agent.output.shops?.slice(0, 3).map((shop: any, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{shop.name}</h4>
                    <p className="text-xs text-gray-600">{shop.address}</p>
                  </div>
                  <Badge variant="info">⭐ {shop.rating}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <br />
                    <span className="font-medium">${shop.price_estimate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Turnaround:</span>
                    <br />
                    <span className="font-medium">{shop.turnaround_days} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <br />
                    <span className="font-medium">{shop.distance_miles} mi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'compliance':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ready to Submit:</span>
              <Badge variant={agent.output.ready_to_submit ? 'success' : 'warning'}>
                {agent.output.ready_to_submit ? 'Yes' : 'No'}
              </Badge>
            </div>

            {agent.output.missing_fields?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Missing Fields:</p>
                <ul className="text-sm space-y-1">
                  {agent.output.missing_fields.map((field: string, index: number) => (
                    <li key={index} className="text-red-600">
                      • {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {agent.output.warnings?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Warnings:</p>
                <ul className="text-sm space-y-1">
                  {agent.output.warnings.map((warning: string, index: number) => (
                    <li key={index} className="text-yellow-600">
                      ⚠ {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      case 'drafting':
        return (
          <div className="space-y-2">
            <p className="text-sm">Claim draft generated successfully!</p>
            {agent.output.pdf_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={agent.output.pdf_url} download>
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        )

      default:
        // Generic JSON display
        return (
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(agent.output, null, 2)}
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
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-sm">{agent.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusStyle.color as any}>{statusStyle.badge}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Dependencies Warning */}
          {agent.dependencies && agent.dependencies.length > 0 && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
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

          {/* Error Display */}
          {agent.status === 'error' && agent.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              <strong>Error:</strong> {agent.error}
            </div>
          )}

          {/* Output Section */}
          {agent.status === 'complete' && agent.output && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-between"
              >
                <span className="font-medium">View Output</span>
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
