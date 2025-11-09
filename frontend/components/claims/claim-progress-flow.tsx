'use client'

import { CheckCircle2, Circle, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ClaimProgressFlowProps {
  currentStep: number
  estimatedPayout?: number
  nextActions?: string[]
}

const CLAIM_STEPS = [
  {
    id: 1,
    name: 'Claim Submitted',
    description: 'Your claim has been received and is being processed',
    bigAction: '✓ Documents uploaded successfully',
    icon: CheckCircle2,
  },
  {
    id: 2,
    name: 'AI Document Analysis',
    description: 'Extracting key data from your documents',
    bigAction: 'Please wait while we analyze your documents (2-3 minutes)',
    icon: Circle,
  },
  {
    id: 3,
    name: 'Cost Estimation & Shop Finder',
    description: 'Calculating payout and finding best repair shops',
    bigAction: 'Please wait while we calculate your payout and find repair shops',
    icon: Circle,
  },
  {
    id: 4,
    name: 'Professional Claim Document',
    description: 'Generating legally-compliant PDF for submission',
    bigAction: 'Please wait while we generate your professional claim document',
    icon: Circle,
  },
  {
    id: 5,
    name: 'Ready to Submit',
    description: 'Your claim is complete and ready to file',
    bigAction: 'Review your claim details and submit to your insurance company',
    icon: Circle,
  },
]

export function ClaimProgressFlow({
  currentStep = 1,
  estimatedPayout,
  nextActions = []
}: ClaimProgressFlowProps) {
  const nextStep = CLAIM_STEPS[currentStep] // Next step to do
  const completedSteps = currentStep - 1

  return (
    <div className="space-y-4">
      {/* BIG NEXT STEP HIGHLIGHT */}
      {nextStep && (
        <div className="bg-white rounded-xl p-6 border-2 border-blue-500 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge className="bg-blue-500 text-white mb-2">NEXT STEP</Badge>
              <h3 className="text-xl font-bold text-gray-900">{nextStep.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{nextStep.description}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-7 w-7 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <p className="text-sm font-bold text-blue-900">👉 {nextStep.bigAction}</p>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-white/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
          <p className="text-sm font-bold text-gray-900">{completedSteps} / {CLAIM_STEPS.length} Complete</p>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${(completedSteps / CLAIM_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Estimated Payout */}
      {estimatedPayout && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase opacity-90">Estimated Payout</p>
          <p className="text-3xl font-bold mt-1">${estimatedPayout.toLocaleString()}</p>
          <p className="text-xs mt-1 opacity-75">Based on damage assessment and historical data</p>
        </div>
      )}
    </div>
  )
}
