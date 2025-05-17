import {
  GuildMember,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';

const Kick: Command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) => option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for kicking')),

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
      return;
    }

    const memberOption = interaction.options.getMember('user');
    const member = memberOption as GuildMember | null;

    if (!member) {
      await interaction.reply({ content: 'User not found or not kickable.', flags: MessageFlags.Ephemeral });
      return;
    }

    const reasonOption = interaction.options.getString('reason');
    const reason = reasonOption || 'No reason provided';

    try {
      await member.kick(reason);
      await interaction.reply({ content: `${member.user.tag} has been **kicked**. Reason: ${reason}` });
    } catch (error) {
      logger.error(error);
      await interaction.reply({ content: 'Failed to kick the user.', flags: MessageFlags.Ephemeral });
    }
  },
};

export default Kick;
