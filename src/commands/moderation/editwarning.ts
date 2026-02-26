import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { eq } from 'drizzle-orm';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';
import db from '../../utils/db';
import { warn } from '../../utils/db/schema';

const EditWarning: Command = {
  data: new SlashCommandBuilder()
    .setName('editwarning')
    .setDescription('Edit the reason for a given warning')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addIntegerOption((option) =>
      option.setName('id').setDescription('The ID of the warning to edit').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('newmessage').setDescription('The new warning message').setRequired(true)
    ),

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a guild.', flags: MessageFlags.Ephemeral });
      return;
    }

    const warningIdOption = interaction.options.getInteger('id', true);
    const newMessageOption = interaction.options.getString('newmessage', true);

    try {
      const [result] = await db.update(warn)
        .set({ reason: newMessageOption })
        .where(eq(warn.id, warningIdOption));

      if (result.affectedRows === 0) {
        await interaction.reply({ 
          content: 'Warning not found.', 
          flags: MessageFlags.Ephemeral 
        });
        return;
      }

      await interaction.reply({
        content: `Warning ID ${warningIdOption} has been updated.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      logger.error('Error updating the warning:', error);
      
      await interaction.reply({ 
        content: 'An error occurred while updating the warning.', 
        flags: MessageFlags.Ephemeral 
      });
    }
  },
};

export default EditWarning;
