import { getAssignmentsData, getWorkers } from "@shared/scheduler/service";

export async function get(query: { startDate?: string; endDate?: string }) {
  const assignments = getAssignmentsData(query.startDate, query.endDate);
  const workers = getWorkers();
  
  // Get unique dates from assignments if no range provided, or just use the range
  const dates = [...new Set(assignments.map(a => a.date))].sort();

  return {
    assignments,
    workers,
    dates
  };
}
