import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';

const Ox: Command = {
  data: new SlashCommandBuilder().setName('ox').setDescription('About Overextended'),
  run: async (interaction) => {
    await interaction.reply({ embeds: [oxEmbed()] });
  },
};

function oxEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('Overextended')
    .setColor('#416bb6')
    .setDescription(
      'Overextended was a small group that operated between 2021 and 2025, creating open-source resources for FiveM with a focus on security, performance, and stability.'
    )
    .addFields(
      {
        name: 'Team',
        value: 'If you wish to donate to any of the original group members, their donation links are listed below.',
      },
      {
        name: 'Linden',
        value: 'https://ko-fi.com/thelindat',
      },
      {
        name: 'Dunak',
        value: 'https://ko-fi.com/dunak',
      },
      {
        name: 'Luke',
        value: 'https://ko-fi.com/lukewastaken',
      },
      {
        name: 'DokaDoka',
        value: 'https://ko-fi.com/dokadoka',
      }
    );

  return embed;
}

export default Ox;
