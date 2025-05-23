import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';
import { DocsUrl, ResourceChoices } from '../../constants';

const Docs: Command = {
  data: new SlashCommandBuilder()
    .setName('docs')
    .setDescription('Get a documentation link for an Overextended resource.')
    .addStringOption((option) =>
      option
        .setName('resource')
        .setDescription('Resource to get the documentation for.')
        .setRequired(true)
        .addChoices(...ResourceChoices)
    ),
  async run(interaction: ChatInputCommandInteraction) {
    const resource = interaction.options.getString('resource', true);
    await sendDocumentationEmbed(interaction, resource);
  },
};

const sendDocumentationEmbed = async (interaction: ChatInputCommandInteraction, resource: string) => {
  const docsEmbed = new EmbedBuilder()
    .setTitle('Documentation')
    .setDescription('Please read the documentation thoroughly and carefully.')
    .setColor('#c5a279')
    .addFields({
      name: resource || 'Website',
      value: `${DocsUrl}/${resource}`,
    });

  await interaction.reply({ embeds: [docsEmbed] });
};

export default Docs;
