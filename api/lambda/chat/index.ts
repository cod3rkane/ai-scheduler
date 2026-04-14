import {google} from "@ai-sdk/google";
import {frontendTools} from "@assistant-ui/react-ai-sdk";
import {convertToModelMessages, streamText, tool} from "ai";
import type {RequestOption} from "@modern-js/plugin-bff/server";

import {outFill, getDb} from "@shared/scheduler/service";

export const maxDuration = 30;

export async function post({query, data}: RequestOption<Record<string, string>, {
  messages: any,
  system: any,
  tools: any
}>) {
  const {messages, system, tools} = await data;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system,
    messages: await convertToModelMessages(messages),
    tools: frontendTools({
      'addSchedule': {
        parameters: {},
        description: 'Fills the schedule for a given data range',
        execute: async ({startDate, endDate}) => {
          return outFill(startDate, endDate);
        },
      },
      'addWorker': {
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the worker.",
            },
            role: {
              type: "string",
              description: "The role of the worker (e.g., Manager, Cook, Server, Dishwasher).",
            },
            skills: {
              type: "string",
              description: "A comma-separated list of the worker's skills.",
            },
          },
          required: ["name", "role"],
        },
        description: 'Adds a new worker to the system.',
        execute: async ({name, role, skills}) => {
          console.log({ name, role, skills});

          const db = getDb();
          const insertWorker = db.prepare('INSERT INTO workers (name, role, skills) VALUES (?, ?, ?)');

          const result = insertWorker.run(name, role, skills || '');

          console.log({ result });

          // @TODO fix return response

          return {success: true, message: `Worker ${name} (${role}) added successfully.`};
        },
      },
      'getAssignedWorkers': {
        parameters: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              format: "date",
              description: "Optional: The start date for filtering assignments in YYYY-MM-DD format.",
            },
            endDate: {
              type: "string",
              format: "date",
              description: "Optional: The end date for filtering assignments in YYYY-MM-DD format.",
            },
          },
        },
        description: 'Fills the schedule for a given data range',
        execute: async ({startDate, endDate}) => {
          const db = getDb();
          let query = `
              SELECT a.date,
                     w.name,
                     w.role
              FROM assignments a
                       JOIN workers w ON a.worker_id = w.id
          `;
          const params: string[] = [];

          if (startDate && endDate) {
            query += ` WHERE a.date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
          } else if (startDate) {
            query += ` WHERE a.date = ?`;
            params.push(startDate);
          } else if (endDate) {
            query += ` WHERE a.date = ?`; // If only endDate is provided, treat it as a single day query
            params.push(endDate);
          }

          query += ` ORDER BY a.date, w.name`;

          const assignedWorkers = db.prepare(query).all(...params) as any[];

          if (assignedWorkers.length === 0) {
            return {assignments: "No workers assigned for the specified period."};
          }

          let result = "Assigned Workers:";
          let currentDate = "";

          for (const assignment of assignedWorkers) {
            if (assignment.date !== currentDate) {
              result += `
--- Date: ${assignment.date} ---
`;
              currentDate = assignment.date;
            }
            result += `- ${assignment.name} (${assignment.role})
`;
          }

          return {assignments: result};
        },
      },
    }),
  });

  console.log({result});

  return result.toUIMessageStreamResponse();
}