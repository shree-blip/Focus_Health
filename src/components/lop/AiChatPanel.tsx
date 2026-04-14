"use client";

import { useState, useRef, useEffect } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { hasPermission } from "@/lib/lop/permissions";
import { useAiChat } from "@/hooks/lop/useAiChat";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  RotateCcw,
  FileText,
  DollarSign,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Calendar,
  CalendarRange,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Daily Briefing", icon: Sparkles, prompt: "Give me today's operational briefing." },
  { label: "Missing Data", icon: ClipboardList, prompt: "Which patients have incomplete profiles? For each patient with missing data, list ALL missing fields grouped by category (Demographics, Contact, Address, Case, Financial, Scheduling, Notes, Documents). Show their data completeness scores and flag critical missing fields." },
  { label: "Missing Docs", icon: FileText, prompt: "Which patients have missing required documents? List them with what's missing." },
  { label: "Today's Activity", icon: Calendar, prompt: "Show me everything that happened today — new patients, status changes, arrivals, payments, and any notable events." },
  { label: "This Week", icon: CalendarRange, prompt: "Give me a summary of this week — new patients added, cases resolved, payments received, arrivals, and key changes." },
  { label: "Collections", icon: DollarSign, prompt: "Analyze our collection rate. Which law firms have the lowest collection rates?" },
  { label: "Follow-Ups", icon: AlertTriangle, prompt: "List all patients needing follow-up with their current notes and how long they've been in that status." },
  { label: "Performance", icon: BarChart3, prompt: "Compare performance across all facilities — patient volume, billing, collection rates, and data completeness." },
];

export function AiChatPanel() {
  const { lopUser } = useLopAuth();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    append,
  } = useAiChat({ contextType: "general" });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for sidebar "open-ai-chat" event (optionally with a prompt payload)
  useEffect(() => {
    const handler = (e: Event) => {
      setOpen(true);
      const detail = (e as CustomEvent)?.detail;
      if (detail?.prompt && typeof detail.prompt === "string") {
        // Small delay so Sheet is open before appending
        setTimeout(() => {
          append({ role: "user", content: detail.prompt });
        }, 150);
      }
    };
    window.addEventListener("open-ai-chat", handler);
    return () => window.removeEventListener("open-ai-chat", handler);
  }, [append]);

  // Only render for admin users
  if (!hasPermission(lopUser, "ai:use")) return null;

  const handleQuickAction = (prompt: string) => {
    append({ role: "user", content: prompt });
  };

  const handleReset = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#D72638] to-[#FF3D57] text-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
          title="AI Assistant"
        >
          <Bot className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400" />
          </span>
        </button>
      )}

      {/* Chat Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[460px] p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-[#0B3B91] to-[#2563EB]">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center gap-2 text-base">
                <Bot className="h-5 w-5" />
                AI Assistant
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">
                  GPT-4o
                </span>
              </SheetTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={handleReset}
                  title="Clear chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">LOP AI Assistant</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Ask me anything about patients, cases, finances, or try
                      &quot;show me yesterday&apos;s activity&quot; or &quot;what data is missing?&quot;
                    </p>
                  </div>

                  {/* Quick actions */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.prompt)}
                          className="flex items-center gap-2 px-3 py-2 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          <action.icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-slate-700">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <AiMarkdown content={message.content} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3 bg-white">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask anything… try &quot;yesterday&quot; or &quot;missing data&quot;"
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={stop}
                  title="Stop generating"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Simple markdown renderer for AI responses.
 * Handles bold, headers, lists, and code blocks.
 */
function AiMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-slate-800 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto my-2">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="font-semibold text-sm mt-3 mb-1">{processInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1">{processInline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="font-bold text-base mt-3 mb-1">{processInline(line.slice(2))}</h2>);
    }
    // Ordered list
    else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5">
          <span className="text-slate-400 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
          <span>{processInline(text)}</span>
        </div>
      );
    }
    // Bullet list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5">
          <span className="text-slate-400 flex-shrink-0">•</span>
          <span>{processInline(line.slice(2))}</span>
        </div>
      );
    }
    // Table row
    else if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      // Skip separator rows
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      const isHeader = i + 1 < lines.length && lines[i + 1]?.includes("---");
      elements.push(
        <div key={i} className={`grid gap-2 text-xs py-1 border-b border-slate-200 ${isHeader ? "font-semibold" : ""}`} style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, ci) => (
            <span key={ci} className="truncate">{processInline(cell)}</span>
          ))}
        </div>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    }
    // Normal paragraph
    else {
      elements.push(<p key={i} className="my-0.5">{processInline(line)}</p>);
    }
  }

  return <>{elements}</>;
}

/** Process inline markdown: **bold**, *italic*, `code` */
function processInline(text: string): React.ReactNode {
  // Split on bold, italic, and code patterns
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith("**")) {
      parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("*")) {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    } else if (m.startsWith("`")) {
      parts.push(
        <code key={match.index} className="bg-slate-200 px-1 py-0.5 rounded text-xs">
          {m.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}
