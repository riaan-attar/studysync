"use client"
import React, { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Mail, MailCheck, ThumbsUp, ThumbsDown, AlertTriangle, Briefcase, Calendar, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Update {
  id: number
  title: string
  summary: string
  discovered_at: string
  is_important: boolean
}

const parseUpdate = (update: Update): { label: string, title: string, isError: boolean } => {
  const match = update.title.match(/^\[(.*?)\]\s+(.*)/);
  if (match) {
    const label = match[1];
    const title = match[2];
    const isError = label === "JSON Parsing Error" || label === "Generation Error";
    return { label, title, isError };
  }
  return { label: "GENERAL", title: update.title, isError: false };
}

const UpdateCard = ({
  update,
  onFeedback,
  isProcessing
}: {
  update: Update,
  onFeedback: (id: number, isCorrect: boolean) => void,
  isProcessing: boolean
}) => {
  const { label, title, isError } = parseUpdate(update);

  const getLabelInfo = () => {
    switch (label) {
      case "DEADLINE":
        return { icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-400/10", borderColor: "border-red-400/20" };
      case "CAREER":
        return { icon: Briefcase, color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/20" };
      case "EVENT":
        return { icon: Calendar, color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/20" };
      default:
        return { icon: MailCheck, color: "text-[#94a3b8]", bgColor: "bg-white/[0.04]", borderColor: "border-white/[0.06]" };
    }
  }

  const { icon: Icon, color, bgColor, borderColor } = getLabelInfo();

  if (isError) {
    return (
      <Card className="border-red-400/20 rounded-xl bg-red-400/[0.04]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300/80 text-sm">{title}</p>
          <p className="text-xs text-[#64748b] mt-3">
            Found {formatDistanceToNow(new Date(update.discovered_at), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="glass-card rounded-xl hover:border-white/[0.12] transition-all duration-200"
      style={{ opacity: isProcessing ? 0.5 : 1 }}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardDescription className={`text-xs font-semibold flex items-center ${color} ${bgColor} ${borderColor} border rounded-md px-2.5 py-1 w-fit mb-2`}>
              <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {label}
            </CardDescription>
            <CardTitle className="text-base font-semibold wrap-break-words text-foreground">
              {title}
            </CardTitle>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFeedback(update.id, true)}
              disabled={isProcessing}
              className="h-8 w-8 text-[#64748b] hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/20 transition-colors"
              title="This classification is correct"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFeedback(update.id, false)}
              disabled={isProcessing}
              className="h-8 w-8 text-[#64748b] hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-colors"
              title="This classification is wrong"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[#94a3b8] text-sm wrap-break-words leading-relaxed">
          {update.summary}
        </p>
        <p className="text-xs text-[#64748b] mt-3">
          Found {formatDistanceToNow(new Date(update.discovered_at), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}

const TriageColumn = ({
  title,
  updates,
  onFeedback,
  processingIds
}: {
  title: string,
  updates: Update[],
  onFeedback: (id: number, isCorrect: boolean) => void,
  processingIds: Set<number>
}) => {
  if (updates.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 min-w-0 sm:min-w-[300px]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        {title}
      </h3>
      <div className="space-y-3">
        {updates.map(update => (
          <UpdateCard
            key={update.id}
            update={update}
            onFeedback={onFeedback}
            isProcessing={processingIds.has(update.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default function UpdatesView() {
  const { session, isFullyAuthenticated, requestProtectedAccess } = useAuth()
  const [updates, setUpdates] = useState<Update[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set())
  const [scanMessage, setScanMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchUpdates = async () => {
    if (!isFullyAuthenticated || !session?.accessToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/updates`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch updates: ${res.status}`);
      }
      const data = await res.json();
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
      setError(error instanceof Error ? error.message : "Failed to load updates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [session, isFullyAuthenticated, apiUrl]);

  const handleScanNow = async () => {
    if (!isFullyAuthenticated || !session?.accessToken) {
      requestProtectedAccess();
      return;
    }

    setIsScanning(true);
    setScanMessage("Starting email scan...");
    setError("");

    try {
      const res = await fetch(`${apiUrl}/api/updates/scan_now`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.accessToken}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Scan failed" }));
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      setScanMessage("Scanning in progress... This may take a minute.");

      setTimeout(async () => {
        setScanMessage("Fetching results...");
        await fetchUpdates();
        setScanMessage("✓ Scan complete!");
        setTimeout(() => setScanMessage(""), 2000);
        setIsScanning(false);
      }, 8000);

    } catch (error) {
      console.error("Failed to trigger scan:", error);
      const errorMessage = error instanceof Error ? error.message : "Scan failed";
      setScanMessage("");
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const sendFeedback = async (updateId: number, isCorrect: boolean) => {
    if (!isFullyAuthenticated || !session?.accessToken) return;

    setProcessingIds(prev => new Set(prev).add(updateId));

    try {
      const res = await fetch(`${apiUrl}/api/updates/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          update_id: updateId,
          is_correct: isCorrect
        }),
      });

      if (res.ok) {
        setUpdates(prev => prev.filter(u => u.id !== updateId));
      } else {
        console.error("Feedback API failed:", res.status);
        setError("Failed to submit feedback");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Failed to send feedback:", error);
      setError("Failed to submit feedback");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(updateId);
        return newSet;
      });
    }
  };

  const { deadlineUpdates, careerUpdates, eventUpdates } = useMemo(() => {
    const deadlines: Update[] = [];
    const careers: Update[] = [];
    const events: Update[] = [];

    updates.forEach(update => {
      if (update.title.startsWith("[DEADLINE]")) {
        deadlines.push(update);
      } else if (update.title.startsWith("[CAREER]")) {
        careers.push(update);
      } else if (update.title.startsWith("[EVENT]")) {
        events.push(update);
      }
    });

    return {
      deadlineUpdates: deadlines,
      careerUpdates: careers,
      eventUpdates: events
    };
  }, [updates]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between glass px-4 sm:px-6 py-3 sm:py-4 flex-wrap gap-4">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#4dfce0]" />
          Mail Triage
        </h1>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleScanNow} disabled={isScanning || !isFullyAuthenticated}>
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Emails
              </>
            )}
          </Button>
          {scanMessage && (
            <p className="text-xs text-[#4dfce0]">{scanMessage}</p>
          )}
          {error && (
            <p className="text-xs text-red-400">⚠️ {error}</p>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <p className="text-[#94a3b8] mb-8 text-sm">
            Your ML model has triaged your inbox into <strong className="text-foreground">Deadlines</strong>, <strong className="text-foreground">Career Opportunities</strong>, and <strong className="text-foreground">Events</strong>.
            Give feedback with 👍 or 👎 to improve your model over time.
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-card rounded-xl">
              <Loader2 className="h-10 w-10 animate-spin text-[#4dfce0] mb-4" />
              <p className="text-sm font-medium text-foreground">Loading updates...</p>
            </div>
          ) : (updates.length > 0) ? (
            <div className="flex flex-col md:flex-row gap-6">
              <TriageColumn
                title="🚀 Deadlines & Opportunities"
                updates={[...deadlineUpdates, ...careerUpdates]}
                onFeedback={sendFeedback}
                processingIds={processingIds}
              />
              <TriageColumn
                title="📅 Events & Meetings"
                updates={eventUpdates}
                onFeedback={sendFeedback}
                processingIds={processingIds}
              />
            </div>
          ) : (
            <Card className="text-center p-8 rounded-xl">
              <CardHeader className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl glass-accent flex items-center justify-center mb-4">
                  <MailCheck className="h-7 w-7 text-[#4dfce0]" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  All Clear for Now!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#94a3b8] text-sm">
                  No important updates were found. Click &quot;Scan Emails&quot; to check for new emails.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}