import { GuildMember } from 'discord.js';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const onMemberJoin = async (member: GuildMember) => {
  logger.debug(`Member join event triggered for ${member.user.tag} (${member.id})`);

  try {
    await prisma.user.upsert({
      where: {
        id: member.user.id,
      },
      update: {
        joinedAt: member.joinedAt || new Date(),
      },
      create: {
        id: member.user.id,
        warns: 0,
        timeouts: 0,
        messageCount: 0,
        joinedAt: member.joinedAt || new Date(),
      },
    });
    logger.info(`Created/Updated initial user record for ${member.user.tag}`);
  } catch (error) {
    logger.error(
      `Error creating initial user record for ${member.user.tag}:`,
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
    );
  }
};
