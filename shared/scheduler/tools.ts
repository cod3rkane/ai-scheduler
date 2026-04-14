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
    description: "Fills the schedule for a given data range",
    execute: async ({startDate, endDate}) => {
      return outFill(startDate, endDate);
    },
  }),
  listWorkers: tool({
    parameters: {type: "object", properties: {}},
    description: "List All Workers",
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
    execute: async ({name, role, skills}) => {
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
    execute: async ({startDate, endDate}) => {
      return getAssignments(startDate, endDate);
    },
  }),
};
