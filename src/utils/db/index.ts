import { drizzle } from "drizzle-orm/mysql2";
import Config from "../../config";

const db = drizzle(Config.DATABASE_URL);

export const formatDate = (date: Date): string => date.toISOString()
  .replace('T', ' ')
  .split('.')[0];

export default db;
