import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/types/agents";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard = ({ agent }: AgentCardProps) => {
  const getStatusIcon = () => {
    switch (agent.status) {
      case "thinking":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4" />;
      case "active":
        return <Brain className="w-4 h-4 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (agent.status) {
      case "thinking":
        return <Badge variant="secondary" className="animate-pulse">Analyzing...</Badge>;
      case "complete":
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Complete</Badge>;
      case "active":
        return <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Active</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <Card className={`transition-all duration-300 ${
      agent.status === "thinking" || agent.status === "active" 
        ? "border-primary/50 shadow-lg" 
        : agent.status === "complete"
        ? "border-green-500/30"
        : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{agent.emoji}</span>
            <div>
              <h3 className="font-semibold text-sm text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">AI Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {agent.thinking && agent.status === "thinking" && (
          <div className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded animate-pulse">
            💭 {agent.thinking}
          </div>
        )}
        {agent.message && (
          <p className="text-sm text-foreground">{agent.message}</p>
        )}
      </CardContent>
    </Card>
  );
};
