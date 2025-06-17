import { GuildMember, PartialGuildMember } from 'discord.js';
import { setTimeout as wait } from 'node:timers/promises';
import { Roles } from '../constants';
import logger from '../utils/logger';

export const onMemberUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
  const before_newRoles = newMember.roles.cache;
  const before_hasGitHubRole = before_newRoles.has(Roles.GitHub);
  const before_hasWardenTagRole = before_newRoles.has(Roles.WardenTag);

  await wait(2500);

  const newRoles = newMember.roles.cache;

  const hasGitHubRole = newRoles.has(Roles.GitHub);
  const hasWardenTagRole = newRoles.has(Roles.WardenTag);
  const hasSupportAccess = newRoles.has(Roles.SupportAccess);

  const shouldHaveSupportAccess = hasGitHubRole && !hasWardenTagRole;

  if (hasGitHubRole !== before_hasGitHubRole || hasWardenTagRole !== before_hasWardenTagRole) {
    const oldRoles = oldMember.roles.cache;
    logger.info(`Cache mismatch for ${newMember.user.id} - ${oldRoles.has(Roles.GitHub)}:${before_hasGitHubRole}:${hasGitHubRole}, ${oldRoles.has(Roles.SupportAccess)}:${before_hasWardenTagRole}:${hasWardenTagRole}`);
  }

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
  }
};
