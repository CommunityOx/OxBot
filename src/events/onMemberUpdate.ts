import { GuildMember, PartialGuildMember } from 'discord.js';
import { Roles } from '../constants';
import logger from '../utils/logger';

export const onMemberUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
  const hasGitHubRole = newMember.roles.cache.has(Roles.GitHub);
  const hasWardenTagRole = newMember.roles.cache.has(Roles.WardenTag);

  if (newMember.roles.cache.has(Roles.SupportAccess)) {
    // remove Support Access role (user unlinked their GitHub or got tagged by Warden)
    if (!hasGitHubRole || hasWardenTagRole) {
      try {
        await newMember.roles.remove(Roles.SupportAccess);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to remove role role ${newMember.user.username}: ${errorMessage}`);
      }
    }
  } else {
    // add Support Access role (user linked their GitHub or got untagged by Warden)
    if (hasGitHubRole && !hasWardenTagRole) {
      try {
        await newMember.roles.add(Roles.SupportAccess);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to add role to ${newMember.user.username}: ${errorMessage}`);
      }
    }
  }
};
