"use client"
import React, { useState, useRef, useEffect, type FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import { Send, Bot, User, Link as LinkIcon, Paperclip, Loader2, X, Check, Zap, Terminal, CheckCircle2 } from "lucide-react"
import { createParser, type EventSourceMessage } from "eventsource-parser"
import { getApiUrl } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  text: string
  sender: "user" | "ai"
}
interface PlanStep {
  type: string
  content: string
}

export default function ChatSection() {
  const { session, status, requestProtectedAccess, isFullyAuthenticated } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null)
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [attachedLink, setAttachedLink] = useState<string | null>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkInputValue, setLinkInputValue] = useState("")

  const startAttachLink = () => setShowLinkInput(true)
  const confirmAttachLink = () => {
    if (linkInputValue.trim()) {
      setAttachedLink(linkInputValue.trim())
      setLinkInputValue("")
      setShowLinkInput(false)
    }
  }
  const removeAttachedLink = () => setAttachedLink(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, planSteps])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !isFullyAuthenticated || !session?.user?.email) {
      requestProtectedAccess();
      return;
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("user_email", session.user.email)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        setUploadedFilePath(file.name)
      } else {
        throw new Error(data.detail || "File upload failed")
      }
    } catch (error) {
      console.error("File upload error:", error)
      alert((error as Error).message);
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !isFullyAuthenticated || !session?.accessToken || !session?.user?.email) {
      requestProtectedAccess()
      return
    }

    const userMessage: Message = { text: input, sender: "user" }
    setMessages((prev) => [...prev, userMessage])
    setPlanSteps([])
    setIsLoading(true)

    const currentInput = input;
    setInput("")

    if (uploadedFilePath) {
      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: currentInput,
            file_name: uploadedFilePath,
            user_email: session.user.email,
            chat_history: messages.slice(-10),
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Failed to get answer");
        }

        setMessages((prev) => [...prev, { text: data.answer, sender: "ai" }]);
        setUploadedFilePath(null);

      } catch (error) {
        const msg = (error as Error).message;
        setMessages((prev) => [...prev, { text: `Error querying document: ${msg}`, sender: "ai" }]);
      } finally {
        setIsLoading(false);
      }

    } else {
      let messageForAgent = currentInput;
      if (attachedLink) {
        messageForAgent = `(Regarding the link: ${attachedLink}) ${messageForAgent}`;
        setAttachedLink(null);
      }

      const response = await fetch(getApiUrl("/api/chat/stream"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          message: messageForAgent,
          access_token: session.accessToken
        }),
      })

      if (!response.ok || !response.body) {
        setIsLoading(false)
        const errorText = await response.text()
        const errorMessage: Message = { text: `Sorry, I ran into an error: ${errorText}`, sender: "ai" }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const parser = createParser({
        onEvent(event: EventSourceMessage) {
          try {
            if (event.event === "start") return
            const data = JSON.parse(event.data)
            if (event.event === "tool_start") {
              setPlanSteps((prev) => [
                ...prev,
                { type: "Tool Call", content: `${data.tool}(${JSON.stringify(data.tool_input)})`},
              ])
            } else if (event.event === "tool_end") {
              setPlanSteps((prev) => [
                ...prev,
                { type: "Tool Output", content: `Result: ${data.output.substring(0, 150)}...`},
              ])
            } else if (event.event === "final_chunk") {
              setMessages((prev) => [...prev, { text: data.output, sender: "ai" }])
              setPlanSteps((prev) => [...prev, { type: "Finished", content: "Agent has finished." }])
            }
          } catch (e) {
            console.error("Streaming parse error:", e)
          }
        },
      })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        parser.feed(chunk)
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 sm:h-auto shrink-0 items-center justify-between glass pl-14 pr-4 sm:px-6 py-0 sm:py-4 ml-0">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">
          Agent Chat
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-2xl glass-accent flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-[#4dfce0]" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Start a conversation</h2>
                <p className="text-[#64748b] text-sm max-w-md">
                  Ask me about your schedule, upload a document, or attach a link for analysis.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-lg glass-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-[#4dfce0]" />
                  </div>
                )}
                <div
                  className={`max-w-lg rounded-xl px-4 py-3 text-sm ${
                    msg.sender === "user"
                      ? "bg-[rgba(77,252,224,0.12)] text-foreground border border-[rgba(77,252,224,0.15)]"
                      : "glass-card"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-[#94a3b8]" />
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            className="relative flex shrink-0 items-center gap-1.5 sm:gap-2 glass px-3 sm:px-4 py-2 sm:py-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {showLinkInput ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  placeholder="Paste link and press Enter"
                  value={linkInputValue}
                  onChange={(e) => setLinkInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); confirmAttachLink(); }
                    if (e.key === "Escape") { e.preventDefault(); setShowLinkInput(false); }
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button type="button" size="icon" onClick={confirmAttachLink} variant="default">
                  <Check className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => setShowLinkInput(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !isFullyAuthenticated} title="Attach File" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button type="button" variant="ghost" onClick={startAttachLink} size="icon" title="Attach link" disabled={isLoading || !isFullyAuthenticated} className="h-8 w-8 sm:h-9 sm:w-9">
                  <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                {attachedLink && (
                  <div className="flex items-center gap-2 rounded-lg glass-accent px-3 py-1.5 text-xs text-[#4dfce0]">
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-[150px] truncate">{attachedLink}</span>
                    <button type="button" onClick={removeAttachedLink} className="p-0.5 hover:bg-white/[0.06] rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {uploadedFilePath && (
                  <div className="flex items-center gap-2 rounded-lg glass-accent px-3 py-1.5 text-xs text-[#4dfce0]">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-[150px] truncate" title={uploadedFilePath}>{uploadedFilePath}</span>
                    <button type="button" onClick={() => setUploadedFilePath(null)} className="p-0.5 hover:bg-white/[0.06] rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <Input
                  placeholder={uploadedFilePath ? "Ask a question..." : "Ask your agent..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!isFullyAuthenticated || isLoading}
                  className="flex-1 rounded-lg px-3 py-2 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                  disabled={!isFullyAuthenticated || isLoading || !input.trim()}
                  title="Send message"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
              </>
            )}
          </form>
        </div>

        {/* Agent Plan sidebar */}
        <aside className="hidden w-80 shrink-0 glass-light p-4 lg:flex flex-col border-l border-white/[0.04]">
          <Card className="h-full rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#4dfce0]" />
                Agent Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {planSteps.length === 0 && (
                <p className="text-[#64748b] text-sm">
                  {isLoading ? "Agent is thinking..." : "The agent's real-time plan will appear here."}
                </p>
              )}
              <div className="relative space-y-3">
                {planSteps.length > 1 && <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/[0.06]"></div>}
                <AnimatePresence>
                  {planSteps.map((step, index) => {
                    const Icon = step.type === "Tool Call" ? Zap : step.type === "Tool Output" ? Terminal : CheckCircle2;
                    const color = step.type === "Tool Call" ? "text-[#4dfce0]" : step.type === "Tool Output" ? "text-[#94a3b8]" : "text-emerald-400";
                    return (
                      <motion.div key={index} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 flex items-start gap-3">
                        <div className={`shrink-0 rounded-lg bg-white/[0.04] border border-white/[0.06] p-1.5 ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${color}`}>{step.type}</p>
                          <p className="break-words text-xs text-[#94a3b8] leading-relaxed">{step.content}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}