import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OrchestratorAgent } from "@/types/orchestrator";
import { Check, Loader2, Clock, XCircle } from "lucide-react";

interface AgentQueueProps {
  agents: OrchestratorAgent[];
}

export const AgentQueue = ({ agents }: AgentQueueProps) => {
  const completedCount = agents.filter(a => a.status === "completed").length;
  const progress = (completedCount / agents.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Done</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600 animate-pulse">Active</Badge>;
      case "failed":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Agent Workflow</CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount} / {agents.length} Complete
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {agents.map((agent, index) => (
          <div
            key={agent.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              agent.status === "in_progress"
                ? "bg-blue-50 border-blue-300 dark:bg-blue-950"
                : agent.status === "completed"
                ? "bg-green-50 border-green-300 dark:bg-green-950"
                : "bg-muted"
            }`}
          >
            <div className="flex-shrink-0 text-2xl">{agent.emoji}</div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
                {getStatusBadge(agent.status)}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {agent.description}
              </p>
            </div>

            <div className="flex-shrink-0">
              {getStatusIcon(agent.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
