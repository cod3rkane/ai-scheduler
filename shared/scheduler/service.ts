import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';
import {BipartiteScheduler, type Worker, type Slot} from '@shared/scheduler/matching';

const DB_PATH = join(process.cwd(), 'scheduler.db');

/**
 * Singleton database instance to avoid multiple connections
 * and prevent initialization during build time.
 */
let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
  }
  return db;
}

/**
 * Fill the schedule for a given date range
 * @param startDate
 * @param endDate
 */
export function outFill(startDate: string, endDate: string) {
  const db = getDb();

  // 1. Fetch data from DB
  const rawWorkers = db.prepare('SELECT id, name, role, skills, is_active FROM workers WHERE is_active = 1').all() as any[];
  const workers: Worker[] = rawWorkers.map(w => ({
    id: Number(w.id),
    name: String(w.name),
    role: String(w.role),
    skills: String(w.skills || ''),
    is_active: w.is_active === 1
  }));
  const requirements = db.prepare('SELECT day_of_week, role, count_needed FROM requirements').all() as any[];

  // Get time off for the range
  const timeOff = db.prepare('SELECT worker_id, date FROM time_off WHERE date BETWEEN ? AND ?').all(startDate, endDate) as any[];

  // 2. Generate required slots for the range
  const slots: Slot[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();

    const dayReqs = requirements.filter(r => r.day_of_week === dayOfWeek);

    for (const req of dayReqs) {
      for (let i = 0; i < req.count_needed; i++) {
        slots.push({
          id: `${dateStr}:${req.role}:${i}`,
          date: dateStr,
          role: req.role,
          worker_id: 0,
        });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  // 3. Filter workers per slot (handle time off)
  // For simplicity in this implementation, we will pass the "eligible" check into the matching algo
  const scheduler = new BipartiteScheduler(workers, slots);

  // Override the buildGraph in the scheduler to respect time-off
  // (In a real app, we'd pass this as a dependency)
  (scheduler as any).buildGraph = function () {
    for (const slot of slots) {
      const eligibleWorkers = workers
        .filter(w => {
          const hasRole = w.role === slot.role;
          const isOnTimeOff = timeOff.some(to => to.worker_id === w.id && to.date === slot.date);
          return hasRole && !isOnTimeOff;
        })
        .map(w => w.id);

      (this as any).adj.set(slot.id, eligibleWorkers);
    }
  };
  (scheduler as any).buildGraph();

  // 4. Solve the matching
  const matches = scheduler.solve();

  // 5. Persist the results
  const insertAssignment = db.prepare('INSERT INTO assignments (worker_id, date) VALUES (?, ?)');

  // Clear existing assignments for the range first (optional, but good for "auto-fill")
  db.prepare('DELETE FROM assignments WHERE date BETWEEN ? AND ?').run(startDate, endDate);

  let assignedCount = 0;
  for (const [workerId, slotId] of matches.entries()) {
    const [date] = slotId.split(':');
    insertAssignment.run(workerId, date);
    assignedCount++;
  }

  return {
    totalSlots: slots.length,
    assignedCount,
    startDate,
    endDate
  };
}

export function getWorkers() {
  const db = getDb();
  const query = db.prepare('SELECT * FROM workers ORDER BY name ASC;');
  return query.all();
}

export function addWorker(name: string, role: string, skills: string = '') {
  const db = getDb();
  const insertWorker = db.prepare('INSERT INTO workers (name, role, skills) VALUES (?, ?, ?)');
  insertWorker.run(name, role, skills);
  return {success: true, message: `Worker ${name} (${role}) added successfully.`};
}

export function getAssignments(startDate?: string, endDate?: string) {
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
    query += ` WHERE a.date = ?`;
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
      result += `\n--- Date: ${assignment.date} ---\n`;
      currentDate = assignment.date;
    }
    result += `- ${assignment.name} (${assignment.role})\n`;
  }

  return {assignments: result};
}
