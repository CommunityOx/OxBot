import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';

const BulkUnban: Command = {
  data: new SlashCommandBuilder()
    .setName('bulkunban')
    .setDescription('Unban all people with the reason included')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason to check for, this checks if the provided string is included in the reason')
        .setRequired(true)
    ),
  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply('This command can only be run in a guild.');
      return;
    }

    const reasonOption = interaction.options.getString('reason', true);

    let amount = 0;

    try {
      const bans = await interaction.guild.bans.fetch();
      logger.info(`Total bans found: ${bans.size}`); // <-- Log total number of bans

      const unbans = bans.filter((ban) => ban.reason && ban.reason.toLowerCase().includes(reasonOption.toLowerCase()));
      logger.info(`Matching bans found: ${unbans.size}`); // <-- Log matched bans

      await interaction.reply(`Starting to unban ${unbans.size} users. This might take a while...`);

      for (const ban of unbans.values()) {
        logger.info(`Attempting to unban: ${ban.user.tag} - Reason: ${ban.reason}`); // <-- Log each user being unbanned
        await interaction.guild.bans.remove(ban.user, `Used /bulkunban for reason: ${reasonOption}`);
        amount++;
      }

      await interaction.followUp(`Successfully unbanned ${amount} users.`);
    } catch (e) {
      logger.error(e);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp('An error occurred while processing the unbans.');
      } else {
        await interaction.reply('An error occurred while processing the unbans.');
      }
    }
  },
};

export default BulkUnban;
