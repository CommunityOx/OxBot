import dotenv from 'dotenv';

dotenv.config();

const envVars = {
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  DISCORD_TOKEN: process.env.TOKEN,
  MEMBER_ROLE_ID: process.env.MEMBER_ROLE_ID,
  ACTION_LOG_CHANNEL: process.env.ACTION_LOG_CHANNEL,
  MESSAGE_LOG_CHANNEL: process.env.MESSAGE_LOG_CHANNEL,
  NODE_ENV: process.env.NODE_ENV || 'development',
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
  MEMBER_ROLE_ID: string;
  ACTION_LOG_CHANNEL: string;
  MESSAGE_LOG_CHANNEL: string;
  NODE_ENV: string;
}

const Config: Env = {
  CLIENT_ID: envVars.CLIENT_ID!,
  GUILD_ID: envVars.GUILD_ID!,
  DISCORD_TOKEN: envVars.DISCORD_TOKEN!,
  MEMBER_ROLE_ID: envVars.MEMBER_ROLE_ID!,
  ACTION_LOG_CHANNEL: envVars.ACTION_LOG_CHANNEL!,
  MESSAGE_LOG_CHANNEL: envVars.MESSAGE_LOG_CHANNEL!,
  NODE_ENV: envVars.NODE_ENV,
};

export default Config;
