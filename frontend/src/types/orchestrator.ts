// Claim Orchestrator Types

export type OrchestratorAgentRole =
  | "claim_analyzer"
  | "policy_expert"
  | "repair_advisor"
  | "claim_optimizer"
  | "claim_drafting"
  | "compliance_submission";

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export type SubmissionMethod = "manual_portal" | "email_draft" | "auto_submit";

export interface OrchestratorAgent {
  id: string;
  name: string;
  role: OrchestratorAgentRole;
  emoji: string;
  description: string;
  status: TaskStatus;
  output?: string;
  confidence?: number;
  color: string;
}

export interface AgentTask {
  agentId: string;
  agentName: string;
  emoji: string;
  summary: string;
  details?: string;
  cost?: number;
  confidence?: number;
}

export interface OrchestrationResult {
  claimAnalysis?: AgentTask;
  policyExpert?: AgentTask;
  repairAdvisor?: AgentTask;
  claimOptimizer?: AgentTask;
  claimDrafting?: AgentTask;
  complianceSubmission?: AgentTask;
}

export interface NextStep {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: SubmissionMethod | "review" | "edit";
  primary?: boolean;
}

export interface ClaimPackage {
  claimId: string;
  status: "draft" | "ready" | "submitted";
  policyNumber?: string;
  vin?: string;
  estimatedPayout?: number;
  deductible?: number;
  damages: Array<{
    item: string;
    cost: number;
    severity: "minor" | "moderate" | "severe";
  }>;
  repairShop?: {
    name: string;
    rating: number;
    turnaround: string;
  };
  recommendations: string[];
  submissionReady: boolean;
}
