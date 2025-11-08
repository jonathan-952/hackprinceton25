export type AgentStatus = "idle" | "thinking" | "complete" | "active";
export type AgentRole = "analyzer" | "policy" | "repair" | "empathy";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  emoji: string;
  status: AgentStatus;
  message: string;
  thinking?: string;
  color: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "in-progress" | "pending";
  agent?: string;
}
