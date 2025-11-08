import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { OrchestrationResult } from "@/types/orchestrator";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";

interface OrchestrationSummaryProps {
  claimId: string;
  results: OrchestrationResult;
  estimatedPayout?: number;
  deductible?: number;
  allComplete: boolean;
}

export const OrchestrationSummary = ({
  claimId,
  results,
  estimatedPayout,
  deductible,
  allComplete,
}: OrchestrationSummaryProps) => {
  const netPayout = estimatedPayout && deductible ? estimatedPayout - deductible : 0;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <CardTitle className="text-xl text-white">
                Claim Orchestrator
              </CardTitle>
            </div>
            {allComplete ? (
              <Badge className="bg-green-600 text-white border-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge className="bg-yellow-600 text-white border-white">
                <AlertCircle className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            )}
          </div>
          <p className="text-sm text-blue-100 mt-2">
            Claim #{claimId} - Full Package Overview
          </p>
        </CardHeader>
      </Card>

      {/* Payout Summary Card */}
      {estimatedPayout && deductible && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Claim</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ${estimatedPayout.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deductible</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  -${deductible.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Net Payout</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  ${netPayout.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Results */}
      <div className="space-y-3">
        {results.claimAnalysis && (
          <TaskCard
            emoji={results.claimAnalysis.emoji}
            name={results.claimAnalysis.agentName}
            summary={results.claimAnalysis.summary}
            details={results.claimAnalysis.details}
            status="completed"
            cost={results.claimAnalysis.cost}
            color="blue"
          />
        )}

        {results.policyExpert && (
          <TaskCard
            emoji={results.policyExpert.emoji}
            name={results.policyExpert.agentName}
            summary={results.policyExpert.summary}
            details={results.policyExpert.details}
            status="completed"
            confidence={results.policyExpert.confidence}
            color="purple"
          />
        )}

        {results.repairAdvisor && (
          <TaskCard
            emoji={results.repairAdvisor.emoji}
            name={results.repairAdvisor.agentName}
            summary={results.repairAdvisor.summary}
            details={results.repairAdvisor.details}
            status="completed"
            color="orange"
          />
        )}

        {results.claimOptimizer && (
          <TaskCard
            emoji={results.claimOptimizer.emoji}
            name={results.claimOptimizer.agentName}
            summary={results.claimOptimizer.summary}
            details={results.claimOptimizer.details}
            status="completed"
            confidence={results.claimOptimizer.confidence}
            color="yellow"
          />
        )}

        {results.claimDrafting && (
          <TaskCard
            emoji={results.claimDrafting.emoji}
            name={results.claimDrafting.agentName}
            summary={results.claimDrafting.summary}
            details={results.claimDrafting.details}
            status="completed"
            color="teal"
          />
        )}

        {results.complianceSubmission && (
          <TaskCard
            emoji={results.complianceSubmission.emoji}
            name={results.complianceSubmission.agentName}
            summary={results.complianceSubmission.summary}
            details={results.complianceSubmission.details}
            status="completed"
            color="green"
          />
        )}
      </div>
    </div>
  );
};
