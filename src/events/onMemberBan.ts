import { Guild, GuildAuditLogsEntry, EmbedBuilder, TextChannel, AuditLogEvent } from 'discord.js';
import Config from '../config';
import logger from '../utils/logger';

export const onMemberBan = async (auditLogEntry: GuildAuditLogsEntry, guild: Guild) => {
  if (auditLogEntry.action !== AuditLogEvent.MemberBanAdd) {
    return;
  }

  if (!auditLogEntry.executorId || !auditLogEntry.targetId) {
    return logger.info('Executor ID or target ID is missing from the audit log entry.');
  }

  const executor = await guild.client.users.fetch(auditLogEntry.executorId);

  const targetUser = await guild.client.users.fetch(auditLogEntry.targetId);

  if (!executor || !targetUser) {
    return logger.info('Executor or target user is missing from the audit log entry.');
  }

  if (auditLogEntry.executorId === '874059310869655662') return; // Check for Warden

  const banEmbed = new EmbedBuilder()
    .setColor('#dc2626')
    .setTitle('Member Banned')
    .setDescription(`<@${targetUser.id}> has been **banned** by <@${executor.id}>.`)
    .addFields({ name: 'Reason', value: auditLogEntry.reason || 'No reason provided.' })
    .setAuthor({
      name: targetUser.username || 'Unknown Username',
      iconURL: targetUser.displayAvatarURL(),
    })
    .setTimestamp(auditLogEntry.createdAt)
    .setFooter({ text: `Member ID: ${targetUser.id}` })
    .setThumbnail(targetUser.displayAvatarURL());

  const channel = guild.channels.cache.get(Config.ACTION_LOG_CHANNEL) as TextChannel;
  channel && channel.send({ embeds: [banEmbed] });
};
