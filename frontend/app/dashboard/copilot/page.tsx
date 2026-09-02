"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  FileCheck,
  ExternalLink,
  Bot,
  User as UserIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Source {
  is_number: string;
  title: string;
  clause_ref: string;
  section_type: string;
  snippet: string;
}

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  hallucination_detected?: boolean;
  verified_citations?: string[];
  sources?: Source[];
}

export default function CopilotChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "copilot",
      text: "Hello! I am your **SpectraIS AI Procurement Compliance Copilot**.\n\nAsk me any question regarding Bureau of Indian Standards (BIS) specifications, mandatory QCO certifications, or tender clause mapping.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Source[] | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputQuery,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery;
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await api.post("/copilot/query", {
        query: currentQuery,
      });
      const data = res.data.data;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "copilot",
        text: data.answer,
        hallucination_detected: data.hallucination_detected,
        verified_citations: data.verified_citations,
        sources: data.retrieved_sources,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || "Unable to connect to BIS Copilot service.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "copilot",
          text: `⚠️ System Notice: ${errorMsg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                BIS Procurement Copilot
                <Badge variant="success" className="text-[10px] py-0">Grounded Engine v2.0</Badge>
              </h2>
              <p className="text-[11px] text-slate-400">Strict Hallucination Prevention Active</p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-blue-400 border border-slate-700"
                }`}
              >
                {msg.sender === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "glass-card text-slate-200 rounded-tl-none border-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Copilot Verification & Citation Badges */}
                {msg.sender === "copilot" && msg.sources && msg.sources.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedSources(msg.sources || null)}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      View {msg.sources.length} Verified Sources
                    </button>

                    {msg.hallucination_detected ? (
                      <Badge variant="warning" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Flagged Citation
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        <ShieldCheck className="h-3 w-3 mr-1" /> 100% Grounded
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
              </div>
              <span>Searching Qdrant Vector Index & Reasoning...</span>
            </div>
          )}
        </div>

        {/* Input Prompt Box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/60 flex gap-2">
          <input
            type="text"
            placeholder="Ask e.g. 'What are the mandatory bolt requirements under IS 1363 for structural steel?'"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Button type="submit" isLoading={isLoading} className="rounded-xl px-5">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Right Drawer: Sources Panel */}
      {selectedSources && (
        <div className="w-80 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-400" /> Grounded References
            </h3>
            <button
              onClick={() => setSelectedSources(null)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            {selectedSources.map((src, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-blue-400">{src.is_number}</div>
                <div className="font-semibold text-slate-200">{src.clause_ref}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">{src.snippet}</p>
                <div className="text-[10px] font-medium text-slate-500 uppercase">{src.section_type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
