import {initDb, seedData} from './db.server';

try {
  console.log('🧠 Starting to Populate DataBase');

  initDb();
  seedData();

  console.log('✨ Database is ready for development!');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to populate database:', error);
  process.exit(1);
}
