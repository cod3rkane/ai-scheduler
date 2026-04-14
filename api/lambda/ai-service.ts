import type {RequestOption} from '@modern-js/plugin-bff/server';

interface ChatMessage {
  message: string;
}

export async function post({query, data}: RequestOption<Record<string, string>, Record<string, string>>) {
  console.log({query, data});

  return {
    reply: "Hi there!"
  }
}
