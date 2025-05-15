import { Interaction, EmbedBuilder, TextChannel } from 'discord.js';
import Config from '../config';
import logger from '../utils/logger';

const commandWhitelist = new Set([
  'guild',
  'help',
  'whois',
  'ox',
  'cox',
  'docs',
  'issue',
  'repo',
  'release',
]);

function getChannelMention(channel: TextChannel | null) {
  return channel ? `<#${channel.id}>` : 'Unknown Channel';
}

export async function onSlashCommand(interaction: Interaction) {
  if (!interaction.isCommand() || !interaction.guild) return;

  if (!commandWhitelist.has(interaction.commandName)) {
    const channelMention = getChannelMention(interaction.channel as TextChannel);

    try {
      const logEmbed = new EmbedBuilder()
        .setColor('#c5a279')
        .setTitle('Slash Command Used')
        .setDescription(`User <@${interaction.user.id}> used \`/${interaction.commandName}\` in ${channelMention}.`)
        .setTimestamp()
        .setFooter({ text: `User ID: ${interaction.user.id}` });

      const logChannel = (await interaction.guild.channels
        .fetch(Config.ACTION_LOG_CHANNEL)
        .catch(logger.error)) as TextChannel;
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        logger.error(`Log channel with ID ${Config.ACTION_LOG_CHANNEL} not found`);
      }
    } catch (error) {
      logger.error('Failed to log slash command usage:', error);
    }
  }
}
