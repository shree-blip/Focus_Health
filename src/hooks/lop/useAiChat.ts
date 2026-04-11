"use client";

import { useChat, type UseChatOptions } from "ai/react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";

interface UseAiChatOptions {
  contextType?: "general" | "dashboard_briefing" | "patient_summary" | "reports_analysis";
  contextId?: string;
  reportData?: string | Record<string, unknown>;
}

export function useAiChat(opts: UseAiChatOptions = {}) {
  const { lopUser, activeFacilityId } = useLopAuth();
  const authUserId = lopUser?.auth_user_id;

  const chatOptions: UseChatOptions = {
    api: "/api/lop/ai/chat",
    body: {
      auth_user_id: authUserId,
      context_type: opts.contextType ?? "general",
      context_id: opts.contextId,
      facility_id: activeFacilityId,
      report_data: opts.reportData,
    },
    headers: {
      "x-lop-user-id": authUserId ?? "",
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
