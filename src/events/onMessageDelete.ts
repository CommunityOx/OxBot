import { Message, EmbedBuilder, PartialMessage, TextChannel, AuditLogEvent, Attachment } from 'discord.js';
import { Bot } from '..';
import Config from '../config';
import logger from '../utils/logger';

export const onMessageDelete = async (message: Message | PartialMessage) => {
  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      logger.error('Error fetching the message:', error);
      return;
    }
  }

  if (!message.guild) return;

  const content = message.content || '**NO MESSAGE SENT**';
  const authorId = message.author?.id || 'Unknown ID';
  const messageId = message.id || 'Unknown ID';

  // Truncate message content if it exceeds the description's 4096 characters limit
  const messageContent = content.length > 4093 ? content.substring(0, 4093) + '...' : content;

  const embed = new EmbedBuilder()
    .setColor('#dc2626')
    .setDescription(
      `**Message sent by <@${authorId}> in ${message.channel.toString()} was deleted.**\n${messageContent}\n`
    )
    .setFooter({ text: `Author ID: ${authorId} | Message ID: ${messageId}`.substring(0, 2048) })
    .setTimestamp(message.createdTimestamp)
    .setAuthor({
      name: (message.author?.username || 'Unknown Username').substring(0, 256),
      iconURL: message.author?.displayAvatarURL() || undefined,
    });

  let i = 0;
  message.attachments.forEach((attachment: Attachment) => {
    if (i < 25) {
      if (attachment.url) {
        embed.addFields({ name: `Attachment ${i + 1}`.substring(0, 256), value: attachment.url.substring(0, 1024) });
        i++;
      }
    }
  });

  const logChannel = Bot.channels.cache.get(Config.LOG_CHANNEL) as TextChannel;
  if (logChannel) {
    try {
      logChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.error('Error sending embed:', error);
    }
  }
};
