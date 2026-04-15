import {tool} from "ai";
import {addWorker, getAssignments, getAssignmentsData, getWorkers, outFill} from "./service";

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
      return outFill(startDate, endDate);
    },
  }),
  listWorkers: tool({
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Optional: Filter workers by name.",
        },
        role: {
          type: "string",
          description: "Optional: Filter workers by role.",
        },
        skills: {
          type: "string",
          description: "Optional: Filter workers by skills.",
        },
      },
    },
    description: "List workers with optional filters.",
    // @ts-ignore
    execute: async ({name, role, skills}: { name?: string, role?: string, skills?: string }) => {
      return getWorkers(name, role, skills);
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
  getVisualSchedule: tool({
    parameters: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          format: "date",
          description: "Optional: The start date in YYYY-MM-DD format.",
        },
        endDate: {
          type: "string",
          format: "date",
          description: "Optional: The end date in YYYY-MM-DD format.",
        },
      },
    },
    description: "Get a structured schedule data for visual representation (graph/timeline).",
    // @ts-ignore
    execute: async ({startDate, endDate}: { startDate?: string, endDate?: string }) => {
      const assignments = getAssignmentsData(startDate, endDate);
      const workers = getWorkers('', '', '') as any[];
      const dates = [...new Set(assignments.map(a => a.date))].sort();
      return {assignments, workers, dates};
    },
  }),
};
