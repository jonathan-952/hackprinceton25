export type ClaimStatus =
  | 'draft'
  | 'processing'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'settled'

export type IncidentType =
  | 'rear-end collision'
  | 'side impact'
  | 'hit-and-run'
  | 'parking lot'
  | 'other'

export type CoverageType =
  | 'comprehensive'
  | 'collision'
  | 'liability'

export type DamageSeverity =
  | 'minor'
  | 'moderate'
  | 'severe'

export interface IncidentData {
  date: string
  time: string
  location: string
  type: IncidentType
  description: string
}

export interface VehicleData {
  year: number
  make: string
  model: string
  license_plate: string
  vin?: string
}

export interface InsuranceData {
  provider: string
  policy_number: string
  coverage_type: CoverageType
  deductible: number
}

export interface DamageData {
  description: string
  severity: DamageSeverity
  photos_uploaded: boolean
}

export interface PoliceReportData {
  filed: boolean
  report_number?: string
  officer_name?: string
  witness_info?: string
}

export interface Claim {
  claim_id: string
  user_id?: string
  status: ClaimStatus
  incident_data: IncidentData
  vehicle_data: VehicleData
  insurance_data: InsuranceData
  damage_data: DamageData
  police_report?: PoliceReportData
  orchestrator_state?: OrchestratorState
  created_at: string
  updated_at: string
}

export interface OrchestratorState {
  core_agent?: AgentOutput
  fintrack?: AgentOutput
  repair_advisor?: AgentOutput
  drafting?: AgentOutput
  compliance?: AgentOutput
}

export interface AgentOutput {
  status: 'idle' | 'running' | 'complete' | 'error'
  data?: any
  error?: string
  timestamp?: string
}

export interface ClaimFormData {
  // Step 1: Incident Information
  incident_date: string
  incident_time: string
  incident_location: string
  incident_type: IncidentType
  incident_description: string

  // Step 2: Vehicle Information
  vehicle_year: number
  vehicle_make: string
  vehicle_model: string
  license_plate: string
  vin?: string

  // Step 3: Insurance Information
  insurance_provider: string
  policy_number: string
  coverage_type: CoverageType
  deductible: number

  // Step 4: Damage Information
  damage_description: string
  damage_severity: DamageSeverity
  damage_photos?: File[]

  // Step 5: Police Report
  police_called: boolean
  police_report_number?: string
  officer_name?: string
  witness_info?: string
}
