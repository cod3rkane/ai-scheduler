import {tool} from "ai";
import {addWorker, getAssignments, getWorkers, outFill} from "./service";

export const schedulerTools = {
  addSchedule: tool({
    parameters: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          format: "date",
          description: "Start date for a schedule in YYYY-MM-DD format",
        },
        endDate: {
          type: "string",
          format: "date",
          description: "End date for a schedule in YYYY-MM-DD format",
        },
      },
      required: ["startDate", "endDate"],
    },
    description: "Fills the schedule for a given startDate and endDate",
    // @ts-ignore
    execute: async ({startDate, endDate}: { startDate: string, endDate: string }) => {
      console.log({startDate, endDate});

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      return outFill(tomorrowStr, nextDayStr);
    },
  }),
  listWorkers: tool({
    parameters: {type: "object", properties: {}},
    description: "List All Workers",
    // @ts-ignore
    execute: async () => {
      return getWorkers();
    },
  }),
  addWorker: tool({
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
    description: "Adds a new worker to the system.",
    // @ts-ignore
    execute: async ({name, role, skills}: { name: string, role: string, skills: string }) => {
      return addWorker(name, role, skills);
    },
  }),
  getAssignedWorkers: tool({
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
    description: "Fills the schedule for a given data range",
    // @ts-ignore
    execute: async ({startDate, endDate}: { startDate: string, endDate: string }) => {
      return getAssignments(startDate, endDate);
    },
  }),
};
