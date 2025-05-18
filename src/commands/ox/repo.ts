import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';
import { GithubApi, GithubUrl, ResourceChoices } from '../../constants';
import logger from '../../utils/logger';

const Repo: Command = {
  data: new SlashCommandBuilder()
    .setName('repo')
    .setDescription('Fetch Community Ox repository')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Name of a Community Ox repository.')
        .setRequired(true)
        .addChoices(...ResourceChoices)
    ),
  async run(interaction: ChatInputCommandInteraction) {
    const repositoryName = interaction.options.getString('name', true);
    await newEmbed(interaction, repositoryName);
  },
};

const newEmbed = async (interaction: ChatInputCommandInteraction, repository: string) => {
  try {
    await interaction.deferReply();

    const response = await fetch(`${GithubApi}/${repository}`);
    const data: any = await response.json();

    const repoEmbed = new EmbedBuilder()
      .setColor('#c5a279')
      .setTitle(data.name)
      .setDescription(data.description)
      .setThumbnail('https://i.imgur.com/Rp4xZiU.png')
      .addFields(
        { name: 'Watchers', value: data.subscribers_count.toString(), inline: true },
        { name: 'Forks', value: data.forks.toString(), inline: true },
        { name: 'Stars', value: data.stargazers_count.toString(), inline: true }
      )
      .setURL(`${GithubUrl}/${repository}`);

    return interaction.editReply({ embeds: [repoEmbed] });
  } catch (error) {
    logger.error('Error fetching repository data:', error);
    return interaction.editReply('An error occurred while fetching repository data.');
  }
};

export default Repo;
