import {google} from "@ai-sdk/google";
import {convertToModelMessages, streamText} from "ai";
import type {RequestOption} from "@modern-js/plugin-bff/server";
import {ollama} from "ai-sdk-ollama";

import {schedulerTools} from "@shared/scheduler/tools";

export async function post({query, data}: RequestOption<Record<string, string>, {
  messages: any,
  system: any,
  tools: any
}>) {
  const {messages, system} = await data;

  const now = new Date();
  const dateContext = `Today is ${now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })}.`;

  const finalSystem = [
    system,
    dateContext,
    "DATE FORMATTING RULES:",
    "- In your text responses, always use human-readable dates (e.g., 'Monday, April 14').",
    "- For tool calls (startDate/endDate), ALWAYS use the 'YYYY-MM-DD' format.",
    "- When requested for a visual schedule, graph, or timeline, use the 'getVisualSchedule' tool.",
    "ROLE FOMRATTING RULES:",
    "- all roles must be a string passing as 'role' parameter",
    "- e.g Manager, Should be role: Manager",
    "- if role parameter is not present, an empty string should be provided",
    "NAME FORMATTING RULES:",
    "- if name parameter is not present, an empty string should be provided",
    "SKILLS FORMATTING RULES:",
    "- if skills parameters is not present, an empty string should be provided",
  ].join('\n\n');

  const result = streamText({
    model: ollama("llama3.2:3b"),
    system: finalSystem,
    messages: await convertToModelMessages(messages),
    tools: {
      ...schedulerTools
    },
  });

  return result.toUIMessageStreamResponse();
}
