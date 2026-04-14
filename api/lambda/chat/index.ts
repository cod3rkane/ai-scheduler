import {google} from "@ai-sdk/google";
import {convertToModelMessages, streamText, tool} from "ai";
import type {RequestOption} from "@modern-js/plugin-bff/server";

import {outFill, getDb} from "@shared/scheduler/service";

export async function post({query, data}: RequestOption<Record<string, string>, {
  messages: any,
  system: any,
  tools: any
}>) {
  const {messages, system} = await data;

  const result = streamText({
    // model: google("gemini-2.5-flash"),
    model: google("gemini-2.0-flash"),
    system,
    messages: await convertToModelMessages(messages),
    maxSteps: 5, // Enable automatic server-side tool execution
    onStepFinish: ({toolCalls, toolResults}) => {
      if (toolCalls.length > 0) {
        console.log('Tool Calls:', JSON.stringify(toolCalls, null, 2));
        console.log('Tool Results:', JSON.stringify(toolResults, null, 2));
      }
    },
    tools: {
      'addSchedule': tool({
        parameters:
          {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                format: "date",
                description: "The start date for scheduling in YYYY-MM-DD format.",
              },
              endDate: {
                type: "string",
                format: "date",
                description: "The end date for scheduling in YYYY-MM-DD format.",
              },
            },
            required: ["startDate", "endDate"],
          },
        description: 'Fills the schedule for a given data range',
        execute: async ({startDate, endDate}) => {
          return outFill(startDate, endDate);
        },
      }),
      'listWorkers': tool({
        parameters: {},
        description: 'List All Workers',
        execute: async () => {
          const db = getDb();
          const query = db.prepare('SELECT * FROM workers ORDER BY name ASC;');

          const workers = query.all();

          return workers;
        },
      }),
      'addWorker': tool({
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
        type: 'function',
        execute: async ({name, role, skills}) => {
          const db = getDb();
          const insertWorker = db.prepare('INSERT INTO workers (name, role, skills) VALUES (?, ?, ?)');

          const result = insertWorker.run(name, role, skills || '');

          return {success: true, message: `Worker ${name} (${role}) added successfully.`};
        },
      }),
      'getAssignedWorkers': ({
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
      }),
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