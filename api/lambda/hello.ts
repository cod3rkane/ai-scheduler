import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';

const dbPath = join(process.cwd(), 'data.db');
const db = new DatabaseSync(dbPath);

db.exec(`
    CREATE TABLE users
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
    )
`);

const insert = db.prepare('INSERT INTO users (name) VALUES (?)');

insert.run('John Kane');

export const get = async () => {
  const query = db.prepare('SELECT * FROM users');
  const results = query.all();

  return `Hi there ${results[0].name}`;
};