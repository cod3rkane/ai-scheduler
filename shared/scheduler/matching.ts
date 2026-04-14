/**
 * Maximum Bipartite Matching Algorithm (Hopcroft-Karp inspired)
 *
 * We have two sets of nodes:
 * 1. Workers (eligible to work a specific role/date)
 * 2. Required Slots (defined by role and date)
 *
 * An edge exists between a Worker and a Slot if:
 * - Worker has the required Role
 * - Worker is not on Time Off for that Date
 */

export interface Worker {
  id: number;
  name: string;
  role: string;
  skills: string;
  is_active: boolean;
}

export interface Slot {
  id: string; // Unique ID for the slot, e.g., "2026-04-18:Cook:1"
  date: string;
  role: string;
  worker_id: number;
}

export class BipartiteScheduler {
  private workers: Worker[];
  private slots: Slot[];
  private adj: Map<string, number[]>; // Slot ID -> Array of Worker IDs

  constructor(workers: Worker[], slots: Slot[]) {
    this.workers = workers;
    this.slots = slots;
    this.adj = new Map();
    this.buildGraph();
  }

  /**
   * Build the adjacency list: Which workers can fill which slots?
   */
  private buildGraph() {
    for (const slot of this.slots) {
      const eligibleWorkers = this.workers
        .filter(w => w.role === slot.role)
        .map(w => w.id);

      this.adj.set(slot.id, eligibleWorkers);
    }
  }

  /**
   * DFS to find an augmenting path for matching
   */
  private dfs(
    slotId: string,
    visited: Set<string>,
    match: Map<number, string>
  ): boolean {
    const eligibleWorkers = this.adj.get(slotId) || [];

    for (const workerId of eligibleWorkers) {
      if (!visited.has(workerId.toString())) {
        visited.add(workerId.toString());

        // If worker is not matched OR the slot they were matched to can find another worker
        const currentMatch = match.get(workerId);
        if (currentMatch === undefined || this.dfs(currentMatch, visited, match)) {
          match.set(workerId, slotId);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Solve the Maximum Matching problem
   * Returns a Map of Worker ID -> Slot ID
   */
  public solve(): Map<number, string> {
    const match = new Map<number, string>(); // Worker ID -> Slot ID

    for (const slot of this.slots) {
      const visited = new Set<string>();
      this.dfs(slot.id, visited, match);
    }

    return match;
  }
}
