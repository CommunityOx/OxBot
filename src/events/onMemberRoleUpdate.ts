import { Guild, GuildAuditLogsEntry, AuditLogEvent } from 'discord.js';
import { Roles } from '../constants';
import logger from '../utils/logger';

export const onMemberRoleUpdate = async (auditLogEntry: GuildAuditLogsEntry, guild: Guild) => {
  if (auditLogEntry.action !== AuditLogEvent.MemberRoleUpdate) {
    return;
  }

  if (!auditLogEntry.executorId || !auditLogEntry.targetId) {
    return logger.info('Executor ID or target ID is missing from the audit log entry.');
  }

  if (auditLogEntry.executorId !== '874059310869655662') return; // Only trigger if it's VVarden

  // logger.debug(`Fetching member: ${auditLogEntry.targetId}`);

  let targetUser;
  try {
    // Wait for a short period to give Warden some time to realize it just removed the role lol
    await new Promise((res) => setTimeout(res, 5000));

    targetUser = await guild.members.fetch(auditLogEntry.targetId);
  } catch (error) {
    return logger.info(`Target user ${auditLogEntry.targetId} not found, possibly left.`);
  }

  if (!targetUser) {
    return logger.info('Unable to find targetUser following MemberRoleUpdate triggering by Warden');
  }

  if (!targetUser.roles.cache.has(Roles.WardenTag) && !targetUser.roles.cache.has(Roles.Member)) {
    try {
      await targetUser.roles.add(Roles.Member);
      logger.info(
        `${targetUser.user.username} was unblacklisted by Warden and didn't get the default member role, role has been returned.`
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to add role to ${targetUser.user.username}: ${errorMessage}`);
    }
  }
};
