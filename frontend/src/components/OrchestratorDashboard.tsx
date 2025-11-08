import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AgentQueue } from "./AgentQueue";
import { OrchestrationSummary } from "./OrchestrationSummary";
import { NextSteps } from "./NextSteps";
import {
  OrchestratorAgent,
  OrchestrationResult,
  NextStep,
  TaskStatus,
} from "@/types/orchestrator";
import { Play, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrchestratorDashboardProps {
  claimId: string;
}

export const OrchestratorDashboard = ({ claimId }: OrchestratorDashboardProps) => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<OrchestratorAgent[]>([
    {
      id: "1",
      name: "Claim Analyzer",
      role: "claim_analyzer",
      emoji: "🕵️",
      description: "Analyzing damage photos and reports",
      status: "pending",
      color: "blue",
    },
    {
      id: "2",
      name: "Policy Expert",
      role: "policy_expert",
      emoji: "⚖️",
      description: "Validating coverage and calculating payout",
      status: "pending",
      color: "purple",
    },
    {
      id: "3",
      name: "Repair Advisor",
      role: "repair_advisor",
      emoji: "🔧",
      description: "Finding certified repair shops",
      status: "pending",
      color: "orange",
    },
    {
      id: "4",
      name: "Claim Optimizer",
      role: "claim_optimizer",
      emoji: "💰",
      description: "Maximizing claim value",
      status: "pending",
      color: "yellow",
    },
    {
      id: "5",
      name: "Claim Drafting Agent",
      role: "claim_drafting",
      emoji: "🧾",
      description: "Generating claim documents",
      status: "pending",
      color: "teal",
    },
    {
      id: "6",
      name: "Compliance & Submission",
      role: "compliance_submission",
      emoji: "✅",
      description: "Validating and preparing submission",
      status: "pending",
      color: "green",
    },
  ]);

  const [orchestrationResults, setOrchestrationResults] = useState<OrchestrationResult>({});
  const [isRunning, setIsRunning] = useState(false);
  const [allComplete, setAllComplete] = useState(false);

  const nextSteps: NextStep[] = [
    {
      id: "1",
      label: "Review Claim Draft",
      description: "Review the complete claim package before submission",
      icon: "file",
      action: "review",
      primary: true,
    },
    {
      id: "2",
      label: "Open Insurer Portal",
      description: "Manually submit via your insurance company's portal (e.g., GEICO)",
      icon: "external",
      action: "manual_portal",
    },
    {
      id: "3",
      label: "Send via Email",
      description: "Email the claim draft directly to your adjuster",
      icon: "mail",
      action: "email_draft",
    },
    {
      id: "4",
      label: "Auto-Submit (Beta)",
      description: "Automatically submit with your credentials (requires authorization)",
      icon: "send",
      action: "auto_submit",
    },
  ];

  const updateAgentStatus = (index: number, status: TaskStatus) => {
    setAgents((prev) =>
      prev.map((agent, i) => (i === index ? { ...agent, status } : agent))
    );
  };

  const runOrchestration = async () => {
    setIsRunning(true);
    setAllComplete(false);
    setOrchestrationResults({});

    toast({
      title: "Orchestration Started",
      description: "AI agents are analyzing your claim...",
    });

    // Simulate Claim Analyzer
    updateAgentStatus(0, "in_progress");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    updateAgentStatus(0, "completed");
    setOrchestrationResults((prev) => ({
      ...prev,
      claimAnalysis: {
        agentId: "1",
        agentName: "Claim Analyzer",
        emoji: "🕵️",
        summary: "Front bumper ($850), Right headlight assembly ($420), Minor frame check needed ($200)",
        details: "Total damage: $1,470. Severity: Moderate. Accident type: Front-end collision.",
        cost: 1470,
      },
    }));

    // Simulate Policy Expert
    updateAgentStatus(1, "in_progress");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    updateAgentStatus(1, "completed");
    setOrchestrationResults((prev) => ({
      ...prev,
      policyExpert: {
        agentId: "2",
        agentName: "Policy Expert",
        emoji: "⚖️",
        summary: "Comprehensive coverage applies. $500 deductible. Estimated payout: $970.",
        details: "Policy #ABC123456. Coverage valid. Deductible: $500. Net payout: $970.",
        confidence: 0.95,
      },
    }));

    // Simulate Repair Advisor
    updateAgentStatus(2, "in_progress");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    updateAgentStatus(2, "completed");
    setOrchestrationResults((prev) => ({
      ...prev,
      repairAdvisor: {
        agentId: "3",
        agentName: "Repair Advisor",
        emoji: "🔧",
        summary: "Joe's Auto Body (4.8★) — 3-day turnaround, OEM parts in stock.",
        details: "Top recommendation: Joe's Auto Body, 123 Main St. Rating: 4.8/5. Estimated repair time: 3 days.",
      },
    }));

    // Simulate Claim Optimizer
    updateAgentStatus(3, "in_progress");
    await new Promise((resolve) => setTimeout(resolve, 1800));
    updateAgentStatus(3, "completed");
    setOrchestrationResults((prev) => ({
      ...prev,
      claimOptimizer: {
        agentId: "4",
        agentName: "Claim Optimizer",
        emoji: "💰",
        summary: "Suggest adding mechanic invoice photo and rental receipts.",
        details: "Recommendations: (1) Attach detailed mechanic invoice, (2) Include rental car receipts, (3) Verify OEM part pricing for potential increase.",
        confidence: 0.82,
      },
    }));

    // Simulate Claim Drafting Agent
    updateAgentStatus(4, "in_progress");
    await new Promise((resolve) => setTimeout(resolve, 2200));
    updateAgentStatus(4, "completed");
    setOrchestrationResults((prev) => ({
      ...prev,
      claimDrafting: {
        agentId: "5",
        agentName: "Claim Drafting Agent",
        emoji: "🧾",
        summary: "Claim summary PDF ready for review.",
        details: "Document includes: damage breakdown, cost analysis, coverage validation, repair recommendations, and submission checklist.",
      },
    }));

    // Simulate Compliance & Submission Agent
    updateAgentStatus(5, "in_progress");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    updateAgentStatus(5, "completed");
    setOrchestrationResults((prev) => ({
      ...prev,
      complianceSubmission: {
        agentId: "6",
        agentName: "Compliance & Submission",
        emoji: "✅",
        summary: "All required fields verified. File ready for insurer submission.",
        details: "Compliance check: ✓ All fields complete, ✓ Documents attached, ✓ Personal data redacted, ✓ Ready for submission.",
      },
    }));

    setIsRunning(false);
    setAllComplete(true);

    toast({
      title: "Orchestration Complete",
      description: "Your claim package is ready for submission!",
      variant: "default",
    });
  };

  const resetOrchestration = () => {
    setAgents((prev) =>
      prev.map((agent) => ({ ...agent, status: "pending" }))
    );
    setOrchestrationResults({});
    setAllComplete(false);
    setIsRunning(false);
  };

  const handleStepClick = (step: NextStep) => {
    toast({
      title: `Action: ${step.label}`,
      description: step.description,
    });
  };

  useEffect(() => {
    // Auto-start orchestration on mount (optional)
    // runOrchestration();
  }, []);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Claim Orchestrator</h2>
          <p className="text-sm text-muted-foreground">
            Automated multi-agent claim package generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={resetOrchestration}
            variant="outline"
            disabled={isRunning || !allComplete}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={runOrchestration}
            disabled={isRunning || allComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Processing..." : "Start Orchestration"}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent Queue */}
        <div className="lg:col-span-1">
          <AgentQueue agents={agents} />
        </div>

        {/* Right: Summary and Next Steps */}
        <div className="lg:col-span-2 space-y-6">
          {allComplete ? (
            <>
              <OrchestrationSummary
                claimId={claimId}
                results={orchestrationResults}
                estimatedPayout={1470}
                deductible={500}
                allComplete={allComplete}
              />
              <NextSteps steps={nextSteps} onStepClick={handleStepClick} />
            </>
          ) : (
            <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {isRunning
                    ? "Orchestration in progress..."
                    : "Click 'Start Orchestration' to begin"}
                </p>
                {!isRunning && (
                  <Button onClick={runOrchestration} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-5 w-5 mr-2" />
                    Start Orchestration
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
