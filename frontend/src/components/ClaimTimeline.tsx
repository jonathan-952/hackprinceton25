import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineEvent } from "@/types/agents";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const initialEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Claim Submitted",
    description: "Initial claim details and photos uploaded",
    timestamp: "2 min ago",
    status: "completed",
  },
];

export const ClaimTimeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);

  useEffect(() => {
    const addEvents = async () => {
      await delay(3000);
      addEvent({
        id: "2",
        title: "Empathy Companion Engaged",
        description: "User greeted and support initiated",
        timestamp: "Just now",
        status: "completed",
        agent: "💬",
      });

      await delay(5000);
      addEvent({
        id: "3",
        title: "Damage Assessment Complete",
        description: "Claim Analyzer identified $1,470 in damages",
        timestamp: "Just now",
        status: "completed",
        agent: "🕵️",
      });

      await delay(4000);
      addEvent({
        id: "4",
        title: "Policy Review Finished",
        description: "Coverage confirmed, $500 deductible applies",
        timestamp: "Just now",
        status: "completed",
        agent: "⚖️",
      });

      await delay(4000);
      addEvent({
        id: "5",
        title: "Repair Shops Identified",
        description: "3 certified shops found in your area",
        timestamp: "Just now",
        status: "completed",
        agent: "🔧",
      });

      await delay(2000);
      addEvent({
        id: "6",
        title: "Insurance Company Notified",
        description: "Claim sent to Allstate for processing",
        timestamp: "Just now",
        status: "in-progress",
      });

      await delay(3000);
      addEvent({
        id: "7",
        title: "Adjuster Assignment",
        description: "Waiting for adjuster to review claim",
        timestamp: "Pending",
        status: "pending",
      });
    };

    addEvents();
  }, []);

  const addEvent = (event: TimelineEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getStatusIcon = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-primary animate-pulse" />;
      case "pending":
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          Live Claim Status
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative animate-fade-in">
              {/* Timeline line */}
              {index !== events.length - 1 && (
                <div className="absolute left-[10px] top-8 w-0.5 h-[calc(100%+1rem)] bg-border" />
              )}
              
              <div className="flex gap-4">
                <div className="relative z-10 bg-background">
                  {getStatusIcon(event.status)}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {event.agent && <span className="text-lg">{event.agent}</span>}
                        <h3 className="font-semibold text-sm text-foreground">{event.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
