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
    description: 'Your claim has been received',
    icon: CheckCircle2,
  },
  {
    id: 2,
    name: 'Data Extraction',
    description: 'AI analyzing your documents',
    icon: Circle,
  },
  {
    id: 3,
    name: 'Damage Assessment',
    description: 'Calculating repair costs',
    icon: Circle,
  },
  {
    id: 4,
    name: 'Shop Recommendations',
    description: 'Finding best repair options',
    icon: Circle,
  },
  {
    id: 5,
    name: 'Document Generation',
    description: 'Creating formal claim',
    icon: Circle,
  },
  {
    id: 6,
    name: 'Compliance Check',
    description: 'Final validation',
    icon: Circle,
  },
  {
    id: 7,
    name: 'Ready to Submit',
    description: 'Claim approved for filing',
    icon: Circle,
  },
]

export function ClaimProgressFlow({
  currentStep = 1,
  estimatedPayout,
  nextActions = []
}: ClaimProgressFlowProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Claim Progress</h3>
          <p className="text-sm text-gray-600">
            Step {currentStep} of {CLAIM_STEPS.length} • {Math.round((currentStep / CLAIM_STEPS.length) * 100)}% Complete
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${(currentStep / CLAIM_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps Flow */}
        <div className="space-y-3 mb-6">
          {CLAIM_STEPS.map((step, index) => {
            const isComplete = index + 1 < currentStep
            const isCurrent = index + 1 === currentStep
            const isPending = index + 1 > currentStep
            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold ${
                        isComplete
                          ? 'text-green-700'
                          : isCurrent
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                    {isComplete && (
                      <Badge variant="success" className="text-xs">
                        Done
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="default" className="text-xs animate-pulse">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Estimated Payout */}
        {estimatedPayout && (
          <div className="bg-white rounded-lg p-4 border-2 border-green-200 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Estimated Payout</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${estimatedPayout.toLocaleString()}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
        )}

        {/* Next Actions */}
        {nextActions.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-2">Next Steps:</p>
                <ul className="space-y-1">
                  {nextActions.map((action, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
