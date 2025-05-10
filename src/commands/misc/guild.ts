import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';

const Guild: Command = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Get an invite link to the selected Guild')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Guild name')
        .setRequired(true)
        .addChoices(
          { name: 'ESX', value: 'esx' },
          { name: 'Qbox', value: 'qbox' },
          { name: 'Overextended', value: 'ox' },
          { name: 'txAdmin', value: 'txAdmin' },
          { name: 'Cfx.re', value: 'cfx' }
        )
    ),

  run: async (interaction: ChatInputCommandInteraction) => {
    const guildName = interaction.options.getString('name');

    switch (guildName) {
      case 'qbox':
        await interaction.reply('https://discord.gg/AtbwBuJHN5');
        break;
      case 'esx':
        await interaction.reply('https://discord.gg/RPX2GssV6r');
        break;
      case 'ox':
        await interaction.reply('https://discord.gg/hmcmv3P7YW');
        break;
      case 'txAdmin':
        await interaction.reply('https://discord.gg/yWxjt9zPWR');
        break;
      case 'cfx':
        await interaction.reply('https://discord.gg/fivem');
        break;
      default:
        await interaction.reply({ content: 'Invalid guild selected.', ephemeral: true });
        break;
    }
  },
};

export default Guild;
