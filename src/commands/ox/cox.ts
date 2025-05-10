import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';

const Cox: Command = {
  data: new SlashCommandBuilder().setName('cox').setDescription('About Community Ox'),
  run: async (interaction) => {
    await interaction.reply({ embeds: [coxEmbed()] });
  },
};

function coxEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('Community Ox')
    .setColor('#416bb6')
    .setDescription(
      'Community Ox is an organization dedicated to maintaining forks of most Overextended resources after the original Overextended team archived their work.'
    )
    .addFields(
      {
        name: 'Team',
        value: 'If you wish to donate to any of the group members, their donation links are listed below.',
      },
      {
        name: 'Zoo',
        value: 'https://ko-fi.com/fjamzoo',
      },
      {
        name: 'ANTOND.',
        value: 'https://ko-fi.com/antond',
      },
      {
        name: 'ESK0',
        value: 'https://github.com/ESK0',
      }
    );

  return embed;
}

export default Cox;
