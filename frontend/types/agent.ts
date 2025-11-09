export type AgentType =
  | 'core_agent'
  | 'fintrack'
  | 'repair_advisor'
  | 'drafting'
  | 'compliance'

export type AgentStatus = 'idle' | 'running' | 'complete' | 'error'

export interface Agent {
  id: AgentType
  name: string
  icon: string
  description: string
  status: AgentStatus
  output?: any
  error?: string
  dependencies?: AgentType[]
}

export interface FinTrackOutput {
  damage_total: number
  deductible: number
  payout: number
  confidence: 'low' | 'medium' | 'high'
  breakdown?: {
    labor?: number
    parts?: number
    paint?: number
    additional?: number
  }
}

export interface RepairShop {
  name: string
  rating: number
  price_estimate: number
  turnaround_days: number
  distance_miles: number
  address: string
  phone?: string
  specialty?: string[]
}

export interface RepairAdvisorOutput {
  shops: RepairShop[]
  recommendation?: string
}

export interface ComplianceOutput {
  all_checks_passed: boolean
  missing_fields: string[]
  ready_to_submit: boolean
  warnings: string[]
  checks: {
    field: string
    required: boolean
    passed: boolean
    message?: string
  }[]
}

export interface DraftingOutput {
  pdf_url: string
  preview_text: string
  generated_at: string
}

export interface CoreAgentOutput {
  extracted_data: {
    incident_info?: any
    parties?: any[]
    damage_assessment?: any
    policy_details?: any
  }
  confidence: number
  processing_time: number
}
