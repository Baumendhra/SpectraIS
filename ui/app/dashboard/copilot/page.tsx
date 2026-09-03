"use client";

import React, { useState } from "react";
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  FileCheck,
  Bot,
  User as UserIcon,
  Search,
  Activity,
  X
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
      text: "Hello! I am your SpectraIS AI Procurement Compliance Copilot.\n\nAsk me any question regarding Bureau of Indian Standards (BIS) specifications, mandatory QCO certifications, or tender clause mapping.",
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
          text: `System Notice: ${errorMsg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 max-w-7xl mx-auto pb-4">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border border-[#c4a484]/40 shadow-card overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-[#c4a484]/30 flex items-center justify-between bg-[#ebe5d8]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-[#6f4e37] flex items-center justify-center text-[#f8f5f0] shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-xs sm:text-sm text-[#3d2b1f] flex items-center gap-2">
                BIS Procurement Copilot
                <Badge variant="success" className="text-[10px] py-0">Grounded Engine v2.0</Badge>
              </h2>
              <p className="text-[10px] text-[#6f4e37]/80">Strict Hallucination Prevention Active</p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#f8f5f0]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-2xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${
                  msg.sender === "user"
                    ? "bg-[#6f4e37] text-[#f8f5f0]"
                    : "bg-[#ebe5d8] text-[#6f4e37] border border-[#c4a484]/50"
                }`}
              >
                {msg.sender === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div className="space-y-1.5">
                <div
                  className={`p-3.5 rounded-lg text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#6f4e37] text-[#f8f5f0]"
                      : "bg-white text-[#3d2b1f] border border-[#c4a484]/40"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Copilot Verification & Citation Badges */}
                {msg.sender === "copilot" && msg.sources && msg.sources.length > 0 && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => setSelectedSources(msg.sources || null)}
                      className="text-[11px] font-semibold text-[#6f4e37] hover:text-[#3d2b1f] flex items-center gap-1 bg-[#ebe5d8] px-2 py-0.5 rounded border border-[#c4a484]/50 transition-colors"
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
            <div className="flex items-center gap-2.5 text-xs text-[#6f4e37]/80">
              <div className="h-7 w-7 rounded-md bg-[#ebe5d8] flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-[#6f4e37] animate-spin" />
              </div>
              <span>Searching Qdrant Vector Index & Reasoning...</span>
            </div>
          )}
        </div>

        {/* Input Prompt Box */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#c4a484]/30 bg-[#ebe5d8] flex gap-2">
          <input
            type="text"
            placeholder="Ask e.g. 'What are the mandatory bolt requirements under IS 1363 for structural steel?'"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-white border border-[#c4a484]/60 rounded-md px-3 py-2 text-xs text-[#3d2b1f] placeholder:text-[#6f4e37]/50 focus:outline-none focus:border-[#6f4e37] focus:ring-1 focus:ring-[#6f4e37]"
          />
          <Button type="submit" isLoading={isLoading} className="px-4">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* Right Drawer: Sources Panel */}
      {selectedSources && (
        <div className="w-80 bg-[#ebe5d8] rounded-lg p-4 border border-[#c4a484]/50 shadow-card flex flex-col space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#c4a484]/30 pb-2.5">
            <h3 className="font-bold text-xs text-[#3d2b1f] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-[#6f4e37]" /> Grounded References
            </h3>
            <button
              onClick={() => setSelectedSources(null)}
              className="text-xs text-[#6f4e37] hover:text-[#3d2b1f]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {selectedSources.map((src, i) => (
              <div key={i} className="p-3 rounded-md bg-white border border-[#c4a484]/40 space-y-1 text-xs">
                <div className="font-bold text-[#6f4e37] font-mono">{src.is_number}</div>
                <div className="font-semibold text-[#3d2b1f]">{src.clause_ref}</div>
                <p className="text-[11px] text-[#3d2b1f]/80 leading-relaxed italic">{src.snippet}</p>
                <div className="text-[10px] font-semibold text-[#6f4e37] uppercase">{src.section_type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
