import { ChannelType, ThreadChannel } from 'discord.js';
import { Channels, SolvedTag } from '../constants';
import logger from '../utils/logger';

export const onThreadUpdate = async (oldThread: ThreadChannel, newThread: ThreadChannel) => {
  if (newThread.parent?.type !== ChannelType.GuildForum || newThread.parentId !== Channels.Support) return;

  const addedTag = newThread.appliedTags.find((tag) => !oldThread.appliedTags.includes(tag));

  if (addedTag === SolvedTag) {
    try {
      await newThread.setLocked(true);
      await newThread.setArchived(true);
    } catch (error) {
      logger.error(`Failed to lock and archive thread ${newThread.id}: ${error}`);
    }
  }
};
