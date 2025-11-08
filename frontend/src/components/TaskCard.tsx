import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { TaskStatus } from "@/types/orchestrator";

interface TaskCardProps {
  emoji: string;
  name: string;
  summary: string;
  details?: string;
  status: TaskStatus;
  confidence?: number;
  cost?: number;
  color: string;
}

export const TaskCard = ({
  emoji,
  name,
  summary,
  details,
  status,
  confidence,
  cost,
  color,
}: TaskCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Complete</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">Working</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className={`p-4 border-l-4 transition-all hover:shadow-md ${
      status === "in_progress" ? "border-l-blue-600" :
      status === "completed" ? "border-l-green-600" :
      status === "failed" ? "border-l-red-600" :
      "border-l-gray-300"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h4 className="font-semibold text-sm">{name}</h4>
            {getStatusBadge()}
          </div>
        </div>
        {getStatusIcon()}
      </div>

      <p className="text-sm text-muted-foreground mb-2">{summary}</p>

      {details && status === "completed" && (
        <div className="mt-3 p-3 bg-muted rounded-md">
          <p className="text-sm">{details}</p>
        </div>
      )}

      {status === "completed" && (
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          {confidence !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Confidence:</span>
              <span className={confidence >= 0.8 ? "text-green-600 font-semibold" : ""}>
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {cost !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Cost:</span>
              <span className="font-semibold text-foreground">${cost.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
