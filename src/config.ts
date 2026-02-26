import dotenv from 'dotenv';

dotenv.config();

const envVars = {
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  DISCORD_TOKEN: process.env.TOKEN,
  ACTION_LOG_CHANNEL: process.env.ACTION_LOG_CHANNEL,
  MESSAGE_LOG_CHANNEL: process.env.MESSAGE_LOG_CHANNEL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MARIADB_USER: process.env.MARIADB_USER,
  MARIADB_PASSWORD: process.env.MARIADB_PASSWORD,
  MARIADB_DATABASE: process.env.MARIADB_DATABASE,
  DB_HOST: process.env.MARIADB_HOST || 'localhost', 
};

const missingVars = Object.entries(envVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}

interface Env {
  DISCORD_TOKEN: string;
  CLIENT_ID: string;
  GUILD_ID: string;
  ACTION_LOG_CHANNEL: string;
  MESSAGE_LOG_CHANNEL: string;
  NODE_ENV: string;
  DATABASE_URL: string;
}

const Config: Env = {
  CLIENT_ID: envVars.CLIENT_ID!,
  GUILD_ID: envVars.GUILD_ID!,
  DISCORD_TOKEN: envVars.DISCORD_TOKEN!,
  ACTION_LOG_CHANNEL: envVars.ACTION_LOG_CHANNEL!,
  MESSAGE_LOG_CHANNEL: envVars.MESSAGE_LOG_CHANNEL!,
  NODE_ENV: envVars.NODE_ENV,
  DATABASE_URL: `mysql://${envVars.MARIADB_USER}:${envVars.MARIADB_PASSWORD}@${envVars.DB_HOST}:3306/${envVars.MARIADB_DATABASE}`,
};

export default Config;