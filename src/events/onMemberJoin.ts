import { GuildMember } from 'discord.js';
import logger from '../utils/logger';
import { Roles } from '../constants';
import db, { formatDate } from '../utils/db';
import { user } from '../utils/db/schema';

export const onMemberJoin = async (member: GuildMember) => {
  logger.debug(`Member join event triggered for ${member.user.tag} (${member.id})`);

  try {
    await db.insert(user)
      .values({
        id: member.user.id,
        warns: 0,
        timeouts: 0,
        joinedAt: formatDate(member.joinedAt || new Date()),
      })
      .onDuplicateKeyUpdate({
        set: { 
          joinedAt: formatDate(member.joinedAt || new Date()),
        }
      });
    logger.debug(`Created/Updated initial user record for ${member.user.tag}`);
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

  try {
    await new Promise((res) => setTimeout(res, 5000));

    // re-fetch the member to ensure we have the latest role information
    const freshMember = await member.guild.members.fetch(member.id);

    if (!freshMember.roles.cache.has(Roles.WardenTag)) {
      await freshMember.roles.add(Roles.Member);
      logger.info(`Added Member role to ${freshMember.user.tag}`);
    } else {
      logger.info(`User ${freshMember.user.tag} already has the WardenTag role, skipping adding Member role`);
    }
  } catch (error) {
    logger.error(
      `Error assigning role to ${member.user.tag}:`,
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
