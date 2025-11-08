import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentCard } from "./AgentCard";
import { Agent } from "@/types/agents";
import { Separator } from "@/components/ui/separator";

const initialAgents: Agent[] = [
  {
    id: "1",
    name: "Claim Analyzer",
    role: "analyzer",
    emoji: "🕵️",
    status: "idle",
    message: "",
    color: "blue",
  },
  {
    id: "2",
    name: "Policy Expert",
    role: "policy",
    emoji: "⚖️",
    status: "idle",
    message: "",
    color: "purple",
  },
  {
    id: "3",
    name: "Repair Advisor",
    role: "repair",
    emoji: "🔧",
    status: "idle",
    message: "",
    color: "orange",
  },
  {
    id: "4",
    name: "Claim Optimizer",
    role: "empathy",
    emoji: "💰",
    status: "idle",
    message: "",
    color: "yellow",
  },
  {
    id: "5",
    name: "Claim Drafting",
    role: "empathy",
    emoji: "🧾",
    status: "idle",
    message: "",
    color: "teal",
  },
  {
    id: "6",
    name: "Compliance Check",
    role: "empathy",
    emoji: "✅",
    status: "idle",
    message: "",
    color: "green",
  },
];

interface MultiAgentPanelProps {
  onOrchestratorStart?: () => void;
}

export const MultiAgentPanel = ({ onOrchestratorStart }: MultiAgentPanelProps = {}) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [collaborationMessage, setCollaborationMessage] = useState("");

  useEffect(() => {
    // All agents start idle - orchestrator triggers them via chat
  }, []);

  // Expose method to trigger orchestrator workflow
  useEffect(() => {
    // Listen for custom event from ClaimDetail
    const handleOrchestratorTrigger = async () => {
      setCollaborationMessage("🎯 Orchestrator workflow initiated...");

      // Run all 6 agents sequentially
      await updateAgent(0, "thinking", "Analyzing damage photos...");
      await delay(1500);
      await updateAgent(0, "active", "Processing claim data...", "Analyzing front bumper, headlight, frame damage");
      await delay(1500);
      await updateAgent(0, "complete", "", "Damage: $1,470 total");

      setCollaborationMessage("🔄 Claim Analyzer → Policy Expert");
      await delay(500);

      await updateAgent(1, "thinking", "Checking policy coverage...");
      await delay(1200);
      await updateAgent(1, "active", "Calculating payout...");
      await delay(1200);
      await updateAgent(1, "complete", "", "Coverage valid. Net payout: $970");

      setCollaborationMessage("🔄 Policy Expert → Repair Advisor");
      await delay(500);

      await updateAgent(2, "thinking", "Finding repair shops...");
      await delay(1000);
      await updateAgent(2, "active", "Comparing shop ratings...");
      await delay(1000);
      await updateAgent(2, "complete", "", "Joe's Auto Body (4.8★) - 3 days");

      setCollaborationMessage("🔄 Repair Advisor → Claim Optimizer");
      await delay(500);

      await updateAgent(3, "thinking", "Analyzing optimization opportunities...");
      await delay(1200);
      await updateAgent(3, "active", "Generating recommendations...");
      await delay(1000);
      await updateAgent(3, "complete", "", "Add invoice for +12% accuracy");

      setCollaborationMessage("🔄 Claim Optimizer → Drafting Agent");
      await delay(500);

      await updateAgent(4, "thinking", "Generating claim draft...");
      await delay(1500);
      await updateAgent(4, "active", "Formatting documents...");
      await delay(1000);
      await updateAgent(4, "complete", "", "Draft ready for review");

      setCollaborationMessage("🔄 Drafting Agent → Compliance Check");
      await delay(500);

      await updateAgent(5, "thinking", "Validating all fields...");
      await delay(1200);
      await updateAgent(5, "active", "Running compliance checks...");
      await delay(1000);
      await updateAgent(5, "complete", "", "All checks passed ✓");

      setCollaborationMessage("✅ Orchestrator workflow complete!");
      await delay(2000);
      setCollaborationMessage("");
    };

    window.addEventListener('triggerOrchestrator', handleOrchestratorTrigger as EventListener);
    return () => {
      window.removeEventListener('triggerOrchestrator', handleOrchestratorTrigger as EventListener);
    };
  }, []);

  const updateAgent = (index: number, status: Agent["status"], thinking?: string, message?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((agent, i) =>
            i === index
              ? { ...agent, status, thinking: thinking || agent.thinking, message: message || agent.message }
              : agent
          )
        );
        resolve();
      }, 100);
    });
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Agent Collaboration
        </CardTitle>
        {collaborationMessage && (
          <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
            {collaborationMessage}
          </p>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
