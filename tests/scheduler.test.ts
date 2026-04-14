import { getDb, initDb, seedData } from '../shared/db.server';
import { outFill } from '../shared/scheduler/service';

async function runTest() {
  console.log('🚀 Starting Scheduler Test...');

  // 1. Initialize and Seed
  initDb();
  seedData();

  const db = getDb();

  // 2. Add some more interesting data
  console.log('📝 Adding extra mock data...');

  // Add more workers to have some competition or surplus
  const extraWorkers = [
    ['Extra Cook 1', 'Cook', 'Grill'],
    ['Extra Cook 2', 'Cook', 'Prep'],
    ['Extra Server 1', 'Server', 'Table service'],
  ];

  const insertWorker = db.prepare('INSERT INTO workers (name, role, skills) VALUES (?, ?, ?)');
  for (const w of extraWorkers) {
    insertWorker.run(...w);
  }

  // Add some time-off
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  // Alice (Manager) takes tomorrow off
  db.prepare('INSERT INTO time_off (worker_id, date) VALUES (?, ?)').run(1, tomorrowStr);
  // Bob (Cook) takes the day after off
  db.prepare('INSERT INTO time_off (worker_id, date) VALUES (?, ?)').run(2, nextDayStr);

  // SCENARIO: Let's increase the requirement for Managers on tomorrow to 3.
  // We only have 2 managers (Alice and George). Alice is off tomorrow.
  const dayOfWeekTomorrow = tomorrow.getDay();
  db.prepare("UPDATE requirements SET count_needed = 3 WHERE day_of_week = ? AND role = 'Manager'").run(dayOfWeekTomorrow);

  console.log(`📅 Testing for range: ${tomorrowStr} to ${nextDayStr}`);

  // 3. Run the scheduler
  const result = outFill(tomorrowStr, nextDayStr);
  console.log('📊 Scheduler Result:', result);

  // 4. Verify Assignments
  console.log('\n📅 ASSIGNMENTS GENERATED:');
  const assignments = db.prepare(`
    SELECT a.date, w.name, w.role
    FROM assignments a
    JOIN workers w ON a.worker_id = w.id
    WHERE a.date BETWEEN ? AND ?
    ORDER BY a.date, w.role
  `).all(tomorrowStr, nextDayStr) as any[];

  if (assignments.length === 0) {
    console.log('❌ No assignments found!');
  } else {
    let currentDate = '';
    assignments.forEach(a => {
      if (a.date !== currentDate) {
        currentDate = a.date;
        console.log(`\n--- ${currentDate} ---`);
      }
      console.log(`[${a.role}] ${a.name}`);
    });
  }

  console.log('\n✨ Test complete!');
}

runTest().catch(console.error);
