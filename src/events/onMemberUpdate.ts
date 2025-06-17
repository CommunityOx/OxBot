import { GuildMember, PartialGuildMember } from 'discord.js';
import { Roles } from '../constants';
import logger from '../utils/logger';

export const onMemberUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
  const newRoles = newMember.roles.cache;

  const hasGitHubRole = newRoles.has(Roles.GitHub);
  const hasWardenTagRole = newRoles.has(Roles.WardenTag);
  const hasSupportAccess = newRoles.has(Roles.SupportAccess);

  const shouldHaveSupportAccess = hasGitHubRole && !hasWardenTagRole;

  if (hasSupportAccess && !shouldHaveSupportAccess) {
    // remove Support Access role (user unlinked their GitHub or got tagged by Warden)
    try {
      await newMember.roles.remove(Roles.SupportAccess);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to remove role role ${newMember.user.username}: ${errorMessage}`);
    }
  } else if (!hasSupportAccess && shouldHaveSupportAccess) {
    // add Support Access role (user linked their GitHub or got untagged by Warden)
    try {
      await newMember.roles.add(Roles.SupportAccess);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to add role to ${newMember.user.username}: ${errorMessage}`);
    }
  } else {
    logger.info(`No role change for ${newMember.user.username}. GitHub: ${hasGitHubRole}; Warden Tag: ${hasWardenTagRole}`);
  }
};
