import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

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
 * Initialize the database schema
 */
export function initDb() {
  const instance = getDb();

  // 1. Workers Table
  instance.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      skills TEXT,
      is_active INTEGER DEFAULT 1
    ) STRICT;
  `);

  // 2. Schedule Requirements
  instance.exec(`
    CREATE TABLE IF NOT EXISTS requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL,
      role TEXT NOT NULL,
      count_needed INTEGER NOT NULL,
      UNIQUE(day_of_week, role)
    ) STRICT;
  `);

  // 3. Assignments
  instance.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      shift_type TEXT NOT NULL DEFAULT 'Full Day',
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    ) STRICT;
  `);

  // 4. Availability
  instance.exec(`
    CREATE TABLE IF NOT EXISTS time_off (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    ) STRICT;
  `);

  console.log('✅ Database initialized');
}

/**
 * Seed data to ensure "No Cold-Start"
 */
export function seedData() {
  const instance = getDb();
  const workerCount = instance.prepare('SELECT COUNT(*) as count FROM workers').get() as { count: number };

  if (workerCount.count > 0) {
    return;
  }

  console.log('🌱 Seeding initial data...');

  const insertWorker = instance.prepare('INSERT INTO workers (name, role, skills) VALUES (?, ?, ?)');
  const workers = [
    ['Alice Smith', 'Manager', 'Scheduling, Finance'],
    ['Bob Johnson', 'Cook', 'Grill, Prep'],
    ['Charlie Brown', 'Cook', 'Pastry, Sous-chef'],
    ['Diana Prince', 'Server', 'Customer Service, Wine'],
    ['Ethan Hunt', 'Server', 'High-speed delivery'],
    ['Fiona Gallagher', 'Dishwasher', 'Fast, Organized'],
    ['George Costanza', 'Manager', 'Architecture, Vandalay'],
    ['Hannah Abbott', 'Server', 'Hospitality'],
    ['Ian Wright', 'Cook', 'Traditional, Plating'],
    ['Jane Doe', 'Dishwasher', 'Reliable'],
  ];

  for (const w of workers) {
    insertWorker.run(...w);
  }

  const insertReq = instance.prepare('INSERT INTO requirements (day_of_week, role, count_needed) VALUES (?, ?, ?)');

  // Weekdays
  for (let day = 1; day <= 5; day++) {
    insertReq.run(day, 'Cook', 2);
    insertReq.run(day, 'Server', 2);
    insertReq.run(day, 'Manager', 1);
    insertReq.run(day, 'Dishwasher', 1);
  }

  // Weekends
  [0, 6].forEach(day => {
    insertReq.run(day, 'Cook', 3);
    insertReq.run(day, 'Server', 4);
    insertReq.run(day, 'Manager', 1);
    insertReq.run(day, 'Dishwasher', 2);
  });

  console.log('✅ Seeding complete');
}

// Export a getter proxy to handle the singleton pattern seamlessly
export default new Proxy({} as DatabaseSync, {
  get(_, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});