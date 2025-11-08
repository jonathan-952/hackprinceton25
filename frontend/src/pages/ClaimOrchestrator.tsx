import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OrchestratorDashboard } from "@/components/OrchestratorDashboard";
import { ArrowLeft, Home } from "lucide-react";

const ClaimOrchestrator = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/claim/${id}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Claim
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  CP
                </div>
                <div>
                  <h1 className="text-lg font-bold">ClaimPilot</h1>
                  <p className="text-xs text-muted-foreground">
                    AI Orchestrator - Claim #{id}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <OrchestratorDashboard claimId={id || "unknown"} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            ClaimPilot AI Orchestrator • Powered by Multi-Agent Collaboration
          </p>
          <p className="mt-1 text-xs">
            This is a simulation. No real claims are submitted.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ClaimOrchestrator;
