import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';
import { Roles } from '../../constants';

const FixRoles: Command = {
  data: new SlashCommandBuilder()
    .setName('fixroles')
    .setDescription('Checks all users and makes sure they have allowed role combinations (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    const members = await interaction.guild.members.fetch();

    let updatedMembers = 0;
    let failedMembers = 0;

    const allMembers = [...members.values()].filter((member) => !member.user.bot);

    for (const member of allMembers) {
      const hasMemberRole = member.roles.cache.has(Roles.Member);
      const hasWardenTagRole = member.roles.cache.has(Roles.WardenTag);

      let rolesChanged = false;

      if (hasMemberRole && hasWardenTagRole) {
        try {
          await member.roles.remove(Roles.Member);
          rolesChanged = true;
          updatedMembers += 1;
        } catch (error) {
          failedMembers += 1;
          logger.error(`Failed to remove Member role from Tagged user - ${member.user.tag}:`, error);
        }
      } else if (!hasMemberRole && !hasWardenTagRole) {
        try {
          await member.roles.add(Roles.Member);
          rolesChanged = true;
          updatedMembers += 1;
        } catch (error) {
          failedMembers += 1;
          logger.error(`Failed to add Member role to empty user - ${member.user.tag}:`, error);
        }
      }

      if (rolesChanged) await new Promise((res) => setTimeout(res, 200));
    }

    let responseMessage = '';

    if (updatedMembers > 0) {
      responseMessage += `Successfully updated roles for ${updatedMembers} members.\n`;
    }

    if (failedMembers > 0) {
      responseMessage += `Failed to update roles for ${failedMembers} members.`;
    }

    if (responseMessage === '') {
      responseMessage = 'No role updates were necessary.';
    }

    await interaction.editReply({ content: responseMessage });
  },
};

export default FixRoles;
