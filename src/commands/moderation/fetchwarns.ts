import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { eq } from 'drizzle-orm';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';
import db from '../../utils/db';
import { warn } from '../../utils/db/schema';

const FetchWarns: Command = {
  data: new SlashCommandBuilder()
    .setName('fetchwarns')
    .setDescription('Display all warnings for a specific user')
    .addUserOption((option) => option.setName('user').setDescription('The user to check').setRequired(true)),

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a guild.', flags: MessageFlags.Ephemeral });
      return;
    }

    const userOption = interaction.options.getUser('user', true);

    try {
      const warnings = await db
        .select({
          id: warn.id,
          reason: warn.reason,
        })
        .from(warn)
        .where(eq(warn.targetId, userOption.id));

      if (warnings.length === 0) {
        await interaction.reply({
          content: `No warnings found for <@${userOption.id}>.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const warningMessages = warnings
        .map((warn: { id: number; reason: string }) => `ID: ${warn.id}, Reason: ${warn.reason}`)
        .join('\n');
      await interaction.reply({ content: `Warnings for <@${userOption.id}>:\n${warningMessages}` });
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        content: 'An error occurred while fetching the warnings.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default FetchWarns;
