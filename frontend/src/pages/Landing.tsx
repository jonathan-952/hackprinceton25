import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Camera, MessageSquare, CheckCircle } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              CP
            </div>
            <span className="text-xl font-bold text-foreground">ClaimPilot</span>
          </div>
          <Link to="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Car Accident Claims,
          <span className="text-primary"> Simplified</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your calm, intelligent assistant for managing insurance claims. Upload photos, track progress, and get guidance every step of the way.
        </p>
        <Link to="/dashboard">
          <Button size="lg" className="text-lg px-8">
            Start Your Claim
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Create a Claim</h3>
              <p className="text-sm text-muted-foreground">
                Start by describing what happened or uploading documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Upload Photos</h3>
              <p className="text-sm text-muted-foreground">
                Add damage photos and documents to support your claim
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Get Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Chat with ClaimPilot for step-by-step assistance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your claim status and next steps in one place
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-primary rounded-2xl p-12 text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your claim?</h2>
          <p className="text-lg mb-6 opacity-90">Join thousands who trust ClaimPilot</p>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 ClaimPilot. Making claims stress-free.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
