import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NextStep } from "@/types/orchestrator";
import {
  ExternalLink,
  Mail,
  Send,
  FileText,
  Edit,
  CheckCircle2,
} from "lucide-react";

interface NextStepsProps {
  steps: NextStep[];
  onStepClick?: (step: NextStep) => void;
}

export const NextSteps = ({ steps, onStepClick }: NextStepsProps) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "external":
        return <ExternalLink className="h-4 w-4" />;
      case "mail":
        return <Mail className="h-4 w-4" />;
      case "send":
        return <Send className="h-4 w-4" />;
      case "file":
        return <FileText className="h-4 w-4" />;
      case "edit":
        return <Edit className="h-4 w-4" />;
      case "check":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <CheckCircle2 className="h-5 w-5" />
          Next Steps
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Review and choose your submission method
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                step.primary
                  ? "border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-700"
                  : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-grow">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    {getIcon(step.icon)}
                    {step.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={step.primary ? "default" : "outline"}
                  onClick={() => onStepClick?.(step)}
                  className={
                    step.primary
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  {step.action === "manual_portal" && "Open Portal"}
                  {step.action === "email_draft" && "Email Draft"}
                  {step.action === "auto_submit" && "Auto Submit"}
                  {step.action === "review" && "Review"}
                  {step.action === "edit" && "Edit"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>
              <strong>Important:</strong> Review all details carefully before submission.
              This orchestrator provides recommendations but does not guarantee claim approval.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
