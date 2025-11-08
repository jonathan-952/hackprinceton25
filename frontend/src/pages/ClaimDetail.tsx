import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { MultiAgentPanel } from "@/components/MultiAgentPanel";
import { ClaimTimeline } from "@/components/ClaimTimeline";

const mockMessages = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm your claim assistant. I can see you've uploaded photos and a police report for your rear-end collision.\n\nI can help you:\n- Run a full analysis of your claim\n- Find repair shops\n- Check your coverage\n- Prepare your submission\n\nWhat would you like to do?",
    timestamp: "10:30 AM",
  },
];

const ClaimDetail = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [orchestratorRunning, setOrchestratorRunning] = useState(false);

  // Simulate orchestrator API call
  const runOrchestrator = async () => {
    setOrchestratorRunning(true);

    // Add chat message saying orchestrator is starting
    const startMsg = {
      id: String(messages.length + 1),
      role: "assistant" as const,
      content: "Perfect! I'm starting the orchestrator to analyze your claim. Watch the agents above as they work through your case...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, startMsg]);

    // Trigger the agent panel to run orchestrator workflow
    window.dispatchEvent(new Event('triggerOrchestrator'));

    // Simulate orchestrator processing (in real app, this would be an API call)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Orchestrator returns results (simulated JSON response)
    const orchestratorResults = {
      claim_id: id,
      status: "complete",
      agents: [
        { id: "claim_analyzer", summary: "Front bumper ($850), right headlight ($420), minor frame check ($200). Total: $1,470" },
        { id: "policy_expert", summary: "Comprehensive coverage valid. $500 deductible. Net payout: $970" },
        { id: "repair_advisor", summary: "Joe's Auto Body (4.8★) - 3 days, parts in stock" },
        { id: "claim_optimizer", summary: "Add mechanic invoice for +12% accuracy" },
        { id: "claim_drafting", summary: "Draft ready for download" },
        { id: "compliance", summary: "All fields validated, ready to submit" },
      ],
      total_damage: 1470,
      deductible: 500,
      net_payout: 970,
    };

    // Chat persona interprets orchestrator results
    const resultMsg = {
      id: String(messages.length + 2),
      role: "assistant" as const,
      content: `Great news! The orchestrator finished analyzing your claim. Here's what we found:

**Damage Assessment:**
Front bumper ($850), right headlight ($420), and minor frame check ($200).
Total damage: $1,470

**Your Coverage:**
Your comprehensive policy covers this! After your $500 deductible, you'll receive $970.

**Repair Recommendation:**
Joe's Auto Body (4.8★ rating) has the parts in stock and can complete repairs in 3 days.

**Optimization Tip:**
If you attach a mechanic's invoice photo, we could increase payout accuracy by 12%.

Your claim package is ready! What would you like to do next?
• Preview the draft
• Find more repair shops
• Submit your claim`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, resultMsg]);
    setOrchestratorRunning(false);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: String(messages.length + 1),
      role: "user" as const,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newUserMessage]);

    // Chat persona responds and can trigger orchestrator
    setTimeout(() => {
      let aiResponse = "";
      const userMsg = message.toLowerCase();

      if (userMsg.includes("start") || userMsg.includes("analyze") || userMsg.includes("begin") || userMsg.includes("full")) {
        // Trigger orchestrator
        runOrchestrator();
        setMessage("");
        return;
      } else if (userMsg.includes("repair") || userMsg.includes("shop")) {
        aiResponse = `I can help you find repair shops! Let me check what's available near you.

Based on your location, here are certified shops:

**Joe's Auto Body** ⭐ 4.8/5
• 123 Main St, San Francisco
• OEM parts in stock
• 3-day turnaround
• Estimated: $1,470

**AutoFix Pro** ⭐ 4.6/5
• 5-day turnaround, $1,520

**Classic Collision** ⭐ 4.5/5
• 7-day turnaround, $1,380

Want more details about any of these?`;
      } else if (userMsg.includes("policy") || userMsg.includes("coverage")) {
        aiResponse = `Let me check your policy coverage.

**Your Policy Status:**
✓ Policy #ABC123456 - Active
✓ Coverage Type: Comprehensive
✓ Deductible: $500
✓ This incident is covered

**Payout Estimate:**
Total Damage: $1,470
Your Deductible: -$500
**Your Payout: $970**

Your policy fully covers this type of collision. You can proceed with the claim!`;
      } else if (userMsg.includes("submit") || userMsg.includes("file") || userMsg.includes("ready")) {
        aiResponse = `Let's get your claim submitted!

**Pre-Submission Checklist:**
✓ Damage photos uploaded
✓ Police report attached
✓ Policy validated
✓ Repair estimates included
✓ Personal data redacted

**Choose How to Submit:**

1. **Manual Portal** - I'll guide you step-by-step through your insurer's portal
2. **Email Draft** - Send the package directly to your adjuster
3. **Auto-Submit** - Automatic submission (requires authorization)

Which method works best for you?`;
      } else if (userMsg.includes("draft") || userMsg.includes("preview") || userMsg.includes("download")) {
        aiResponse = `Your claim draft is ready to preview!

📄 **Claim Package Includes:**
• Damage assessment with photos
• Policy coverage confirmation
• Repair estimates
• Payout calculation
• Submission checklist

**Available Actions:**
• [Preview PDF] - View the formatted document
• [Download JSON] - Get structured data
• [Edit Details] - Make changes before submitting

What would you like to do?`;
      } else {
        aiResponse = `I'm here to help with your claim! I can:

**Run Analysis:**
• "Start full analysis" - Run the orchestrator to analyze everything

**Get Information:**
• "Show repair shops" - Find certified repair shops
• "Check my coverage" - Review your policy
• "Preview draft" - See your claim package

**Submit Claim:**
• "Ready to submit" - Prepare for submission

What would you like me to do?`;
      }

      const aiMsg = {
        id: String(messages.length + 2),
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Rear-end collision on Highway 101</h1>
              <p className="text-sm text-muted-foreground">Claim #{id}</p>
            </div>
          </div>
          <Badge>In Progress</Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Multi-Agent System */}
        <MultiAgentPanel />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ClaimTimeline />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Claim Assistant
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {orchestratorRunning ? "🤖 Orchestrator running..." : "Ask me anything about your claim"}
                </p>
              </CardHeader>
              <Separator />

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div
                        className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                        style={{
                          color: msg.role === "user" ? "white" : "inherit"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/- (.*?)$/gm, '• $1')
                            .replace(/\n/g, '<br />')
                        }}
                      />
                      <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-200" : "text-muted-foreground"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Quick Actions */}
              <Separator />
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMessage("Start full analysis");
                      setTimeout(() => handleSend(), 100);
                    }}
                    disabled={orchestratorRunning}
                  >
                    🎯 Run Orchestrator
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMessage("Show repair options");
                      setTimeout(() => handleSend(), 100);
                    }}
                  >
                    🔧 Repair Shops
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMessage("Check my policy");
                      setTimeout(() => handleSend(), 100);
                    }}
                  >
                    ⚖️ Coverage
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMessage("Ready to submit");
                      setTimeout(() => handleSend(), 100);
                    }}
                  >
                    ✅ Submit
                  </Button>
                </div>
              </div>

              {/* Input */}
              <Separator />
              <div className="p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Ask the orchestrator anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Claim Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Claim Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Date of Incident</p>
                  <p className="text-sm text-muted-foreground">January 5, 2025</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground">Location</p>
                  <p className="text-sm text-muted-foreground">Highway 101, San Francisco</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground">Vehicle</p>
                  <p className="text-sm text-muted-foreground">2022 Toyota Camry</p>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">front_damage.jpg</p>
                    <p className="text-xs text-muted-foreground">2.3 MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">police_report.pdf</p>
                    <p className="text-xs text-muted-foreground">1.5 MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                    <span className="text-xs text-secondary-foreground font-bold">1</span>
                  </div>
                  <p className="text-sm text-foreground flex-1">Upload remaining photos</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    <span className="text-xs text-muted-foreground font-bold">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">Notify your insurer</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    <span className="text-xs text-muted-foreground font-bold">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">Get repair estimates</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;
