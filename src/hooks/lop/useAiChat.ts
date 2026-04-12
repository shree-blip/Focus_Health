"use client";

import { useChat, type UseChatOptions } from "ai/react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";

interface UseAiChatOptions {
  contextType?: "general" | "dashboard_briefing" | "patient_summary" | "reports_analysis";
  contextId?: string;
  reportData?: string | Record<string, unknown>;
}

export function useAiChat(opts: UseAiChatOptions = {}) {
  const { activeFacilityId } = useLopAuth();

  const chatOptions: UseChatOptions = {
    api: "/api/lop/ai/chat",
    body: {
      // HIPAA: No auth_user_id in body — server reads identity from session cookie
      context_type: opts.contextType ?? "general",
      context_id: opts.contextId,
      facility_id: activeFacilityId,
      report_data: opts.reportData,
    },
    initialMessages: [],
  };

  const chat = useChat(chatOptions);

  return {
    messages: chat.messages,
    input: chat.input,
    handleInputChange: chat.handleInputChange,
    handleSubmit: chat.handleSubmit,
    isLoading: chat.isLoading,
    stop: chat.stop,
    setMessages: chat.setMessages,
    append: chat.append,
    setInput: chat.setInput,
  };
}
