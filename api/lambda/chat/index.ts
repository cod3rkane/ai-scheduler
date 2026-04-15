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

  const result = streamText({
    model: ollama("llama3.2:3b"),
    system,
    messages: await convertToModelMessages(messages),
    tools: {
      ...schedulerTools
    },
  });

  return result.toUIMessageStreamResponse();
}