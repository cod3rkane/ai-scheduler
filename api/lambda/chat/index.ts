import {google} from "@ai-sdk/google";
import {frontendTools} from "@assistant-ui/react-ai-sdk";
import {convertToModelMessages, streamText} from "ai";
import type {RequestOption} from "@modern-js/plugin-bff/server";

export const maxDuration = 30;

export async function post({query, data}: RequestOption<Record<string, string>, {
  messages: any,
  system: any,
  tools: any
}>) {
  const {messages, system, tools} = await data;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system,
    messages: await convertToModelMessages(messages),
    tools: frontendTools(tools),
  });

  return result.toUIMessageStreamResponse();
}