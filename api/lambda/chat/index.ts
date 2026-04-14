import {google} from "@ai-sdk/google";
import {convertToModelMessages, streamText} from "ai";
import type {RequestOption} from "@modern-js/plugin-bff/server";

import {schedulerTools} from "@shared/scheduler/tools";

export async function post({query, data}: RequestOption<Record<string, string>, {
  messages: any,
  system: any,
  tools: any
}>) {
  const {messages, system} = await data;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system,
    messages: await convertToModelMessages(messages),
    maxSteps: 5, // Enable automatic server-side tool execution
    tools: {
      ...schedulerTools
    },
  });

  await result.toolCalls.then((events) => {
    console.log({events});

    events.forEach((event) => {
      if (event.type === "tool-call") {

      }
    })
  });
  await result.toolResults.then(console.log);
  await result.consumeStream();

  console.log({result});

  return result.toUIMessageStreamResponse();
}