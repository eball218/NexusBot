import { createDb, type Database } from '@nexusbot/db';
import { config } from './config';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = createDb(config.database.url);
  }
  return db;
}
