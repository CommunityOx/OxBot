import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction, MessageFlags } from 'discord.js';
import { eq } from 'drizzle-orm';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';
import db from '../../utils/db';
import { ban } from '../../utils/db/schema';

const Unban: Command = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) => option.setName('user').setDescription('The user to unban').setRequired(true))
    .addStringOption((option) =>
      option.setName('reason').setDescription('The reason for the unban').setRequired(false)
    ),

  async run(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a guild.', flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userOption = interaction.options.get('user');
    const reasonOption = interaction.options.get('reason');

    const user = userOption?.user;
    const reason = (reasonOption?.value as string) || 'No reason provided';

    if (!user) {
      await interaction.editReply('User not found!');
      return;
    }

    try {
      const [banRecord] = await db
        .select()
        .from(ban)
        .where(eq(ban.targetId, user.id))
        .limit(1);

      if (banRecord) {
        await db.delete(ban).where(eq(ban.id, banRecord.id));
      }

      await interaction.guild.members.unban(user, reason);
      await interaction.editReply(`Unbanned <@${user.id}>. Reason: ${reason}`);
    } catch (error) {
      logger.error(error);
      await interaction.editReply('An error occurred while processing the unban.');
    }
  },
};

export default Unban;
