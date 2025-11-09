'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { AgentCard } from './agent-card'
import { Agent, AgentType } from '@/types/agent'
import { Claim } from '@/types/claim'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface OrchestratorPanelProps {
  claim: Claim
  onAgentComplete?: (agentType: AgentType, output: any) => void
}

export function OrchestratorPanel({ claim, onAgentComplete }: OrchestratorPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    initializeAgents()
  }, [claim])

  const initializeAgents = () => {
    const orchestratorState = claim.orchestrator_state || {}

    const agentConfigs: Agent[] = [
      {
        id: 'core_agent',
        name: 'ClaimPilot Core',
        description: 'Analyzes and extracts key information from your uploaded documents including police reports, insurance forms, and accident photos. This agent structures the raw data into a format our other agents can use.',
        status: orchestratorState.core_agent?.status || 'idle',
        output: orchestratorState.core_agent?.data,
      },
      {
        id: 'fintrack',
        name: 'FinTrack',
        description: 'Estimates repair costs and calculates your expected payout based on damage severity, vehicle make/model, and historical claim data. Helps you know if settlement offers are fair.',
        status: orchestratorState.fintrack?.status || 'idle',
        output: orchestratorState.fintrack?.data,
        dependencies: ['core_agent'],
      },
      {
        id: 'repair_advisor',
        name: 'Repair Advisor',
        description: 'Finds nearby certified repair shops, compares their ratings and pricing, and recommends the best options based on your vehicle type and damage. Includes real customer reviews and estimated wait times.',
        status: orchestratorState.repair_advisor?.status || 'idle',
        output: orchestratorState.repair_advisor?.data,
      },
      {
        id: 'drafting',
        name: 'Claim Drafting Agent',
        description: 'Creates a professional, legally-compliant claim document ready to submit to your insurance company. Includes all necessary details, supporting evidence, and calculated estimates in a formal PDF format.',
        status: orchestratorState.drafting?.status || 'idle',
        output: orchestratorState.drafting?.data,
        dependencies: ['core_agent', 'fintrack'],
      },
      {
        id: 'compliance',
        name: 'Compliance & Submission',
        description: 'Checks your claim for completeness, verifies all required documents are included, and ensures compliance with state laws and insurance requirements before final submission.',
        status: orchestratorState.compliance?.status || 'idle',
        output: orchestratorState.compliance?.data,
      },
    ]

    setAgents(agentConfigs)
  }

  const runAgent = async (agentId: AgentType) => {
    // Update agent status to running
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'running', error: undefined } : agent
      )
    )

    try {
      let response
      let output

      switch (agentId) {
        case 'core_agent':
          // Call core agent API
          response = await fetch(`http://localhost:8000/api/claims/${claim.claim_id}/extract`, {
            method: 'POST',
          })
          if (!response.ok) throw new Error('Core agent failed')
          output = await response.json()
          break

        case 'fintrack':
          // Call FinTrack agent
          response = await fetch(`http://localhost:8000/api/estimate/${claim.claim_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              damage_description: claim.damage_data.description,
              damage_severity: claim.damage_data.severity,
              deductible: claim.insurance_data.deductible,
              photos_uploaded: claim.damage_data.photos_uploaded,
            }),
          })
          if (!response.ok) throw new Error('FinTrack failed')
          output = await response.json()
          break

        case 'repair_advisor':
          // Call Repair Advisor agent
          response = await fetch(`http://localhost:8000/api/shops/${claim.claim_id}`, {
            method: 'GET',
          })
          if (!response.ok) throw new Error('Repair Advisor failed')
          output = await response.json()
          break

        case 'drafting':
          // Call Drafting agent
          response = await fetch(`http://localhost:8000/api/claims/${claim.claim_id}/draft`, {
            method: 'POST',
          })
          if (!response.ok) throw new Error('Drafting agent failed')
          output = await response.json()
          break

        case 'compliance':
          // Call Compliance agent
          response = await fetch(
            `http://localhost:8000/api/claims/${claim.claim_id}/compliance-check`,
            {
              method: 'POST',
            }
          )
          if (!response.ok) throw new Error('Compliance check failed')
          output = await response.json()
          break
      }

      // Update agent status to complete
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId ? { ...agent, status: 'complete', output } : agent
        )
      )

      // Notify parent component
      if (onAgentComplete) {
        onAgentComplete(agentId, output)
      }
    } catch (error: any) {
      console.error(`Error running ${agentId}:`, error)

      // Update agent status to error
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? { ...agent, status: 'error', error: error.message || 'Failed to run agent' }
            : agent
        )
      )
    }
  }

  const coreAgents = agents.filter((a) => ['core_agent', 'fintrack'].includes(a.id))
  const advisoryAgents = agents.filter((a) => ['repair_advisor', 'drafting'].includes(a.id))
  const complianceAgents = agents.filter((a) => a.id === 'compliance')

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg text-gray-900">Claim Orchestrator</h3>
        <p className="text-sm text-gray-700">
          Run specialized agents to process and analyze your claim
        </p>
      </div>

      <Tabs defaultValue="all" className="p-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="advisory">Advisory</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onRun={() => runAgent(agent.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="core" className="space-y-4 mt-4">
          {coreAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onRun={() => runAgent(agent.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="advisory" className="space-y-4 mt-4">
          {advisoryAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onRun={() => runAgent(agent.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4 mt-4">
          {complianceAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onRun={() => runAgent(agent.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
