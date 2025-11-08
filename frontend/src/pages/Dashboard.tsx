import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, FileText, Clock, CheckCircle2 } from "lucide-react";

const mockClaims = [
  {
    id: "1",
    title: "Rear-end collision on Highway 101",
    date: "2025-01-05",
    status: "in-progress",
    lastUpdate: "Documents uploaded",
  },
  {
    id: "2",
    title: "Parking lot minor damage",
    date: "2024-12-28",
    status: "completed",
    lastUpdate: "Claim approved",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              CP
            </div>
            <span className="text-xl font-bold text-foreground">ClaimPilot</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome back, Phil</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Claims</h1>
            <p className="text-muted-foreground">Manage your insurance claims in one place</p>
          </div>
          <Link to="/claim/new">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </Link>
        </div>

        {/* Claims Grid */}
        {mockClaims.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No claims yet</h3>
            <p className="text-muted-foreground mb-6">Start your first claim to get assistance</p>
            <Link to="/claim/new">
              <Button>Create Your First Claim</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockClaims.map((claim) => (
              <Link key={claim.id} to={`/claim/${claim.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={claim.status === "completed" ? "secondary" : "default"}
                      >
                        {claim.status === "in-progress" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {claim.status === "completed" && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {claim.status === "in-progress" ? "In Progress" : "Completed"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{claim.title}</CardTitle>
                    <CardDescription>Started {claim.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last update: {claim.lastUpdate}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
