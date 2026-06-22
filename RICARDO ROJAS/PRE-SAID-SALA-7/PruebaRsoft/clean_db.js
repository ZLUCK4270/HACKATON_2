import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'database.sqlite'));
db.prepare("DELETE FROM channels WHERE channel_id LIKE 'http%' OR channel_id = 'UCX6OQ3DkcsbYNE6H8uQquQA'").run();
console.log('Cleaned db');
