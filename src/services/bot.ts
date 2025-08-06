
/**
 * @fileOverview This file initializes and manages the Discord bot client,
 * connecting to the Discord Gateway to listen for real-time events.
 * It also handles incoming interactions like slash commands and button clicks.
 */
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { 
    Client, 
    Events, 
    GatewayIntentBits,
    Interaction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    EmbedBuilder,
    REST,
    Routes
} from 'discord.js';
import { getGuildChannels } from './discord';

const commands = [
  {
    name: 'sugestao',
    description: 'Guia o usuário para o canal de sugestões.',
  },
  {
    name: 'denunciar',
    description: 'Abre um formulário para criar uma denúncia privada.',
  },
];


async function registerGuildCommands(guildId: string): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId || !token) {
    throw new Error('Variáveis de ambiente DISCORD_CLIENT_ID ou DISCORD_BOT_TOKEN ausentes.');
  }
  
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`Iniciando a inscrição de ${commands.length} comandos (/) de aplicação para o servidor ${guildId}.`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Comandos de aplicação (/) foram recarregados com sucesso para o servidor ${guildId}.`);
  } catch (error) {
    console.error(`Falha ao registrar comandos para o servidor ${guildId}:`, error);
  }
}


// Ensure necessary environment variables are set
if (!process.env.DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN environment variable is not set. Bot will not start.');
} else {
    console.log('Initializing Discord Bot...');
    
    // Create a new client instance
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    
    /**
     * Event handler for when the client is ready.
     */
    client.once(Events.ClientReady, async (readyClient) => {
      console.log(`Discord Bot is ready! Logged in as ${readyClient.user.tag}`);
      // Register commands for all guilds the bot is in.
      const guilds = await readyClient.guilds.fetch();
      for (const [, guild] of guilds) {
        await registerGuildCommands(guild.id);
      }
    });
    
    /**
     * Event handler for when the bot joins a new guild (server).
     */
    client.on(Events.GuildCreate, async (guild) => {
      console.log(`Bot has been added to a new guild: ${guild.name} (ID: ${guild.id})`);
      await registerGuildCommands(guild.id);
    });

    /**
     * Event handler for new messages.
     */
    client.on(Events.MessageCreate, async (message) => {
        // If the message is in a suggestions channel, add reactions.
        if (message.channel.type === ChannelType.GuildForum) {
            const { channels } = await getGuildChannels(message.guildId!);
            const suggestionChannel = channels.find(c => c.name.toLowerCase().includes('sugestoes'));
            if (suggestionChannel && message.channel.id === suggestionChannel.id) {
                 if (message.type === 20) { // THREAD_CREATED
                    try {
                        await message.react('👍');
                        await message.react('👎');
                    } catch (error) {
                        console.error('Failed to add reactions to suggestion thread:', error);
                    }
                 }
            }
        }
    });


    /**
     * Event handler for interactions (slash commands, buttons, modals).
     */
    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            // Handle slash commands
            if (interaction.commandName === 'denunciar') {
                await handleOpenReportModal(interaction);
            } else if (interaction.commandName === 'sugestao') {
                const { channels } = await getGuildChannels(interaction.guildId!);
                const suggestionChannel = channels.find(c => c.name.toLowerCase().includes('sugestoes'));
                if (suggestionChannel) {
                    await interaction.reply({
                        content: `Para enviar uma sugestão, por favor, crie um novo post no canal de fórum <#${suggestionChannel.id}>!`,
                        ephemeral: true,
                    });
                } else {
                     await interaction.reply({
                        content: 'O canal de sugestões não está ativado neste servidor.',
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isButton()) {
            // Handle button clicks
            if (interaction.customId === 'open_report_modal') {
                 await handleOpenReportModal(interaction);
            } else if (interaction.customId === 'close_report_thread') {
                await handleCloseReportThread(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            // Handle modal submissions
            if (interaction.customId === 'report_modal') {
                await handleReportModalSubmit(interaction);
            }
        }
    });

    /**
     * Shows the report modal to the user.
     */
    async function handleOpenReportModal(interaction: any) {
        const modal = new ModalBuilder()
            .setCustomId('report_modal')
            .setTitle('Formulário de Denúncia');

        const tagInput = new TextInputBuilder()
            .setCustomId('report_tag')
            .setLabel('Motivo da Denúncia (TAG)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Bullying, Spam, Assédio, etc.')
            .setRequired(true);
        
        const reasonInput = new TextInputBuilder()
            .setCustomId('report_reason')
            .setLabel('Descreva o ocorrido')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const proofInput = new TextInputBuilder()
            .setCustomId('report_proof')
            .setLabel('Links para Provas (prints, etc.)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://imgur.com/link1, https://imgur.com/link2')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(proofInput),
        );

        await interaction.showModal(modal);
    }
    
    /**
     * Handles the submission of the report modal.
     */
    async function handleReportModalSubmit(interaction: any) {
        if (!interaction.guild) {
             await interaction.reply({ content: 'Ocorreu um erro. Servidor não encontrado.', ephemeral: true });
             return;
        }

        const { channels } = await getGuildChannels(interaction.guildId);
        let reportChannel = channels.find(c => c.name.toLowerCase().includes('denuncias'));

        if (!reportChannel) {
             await interaction.reply({ content: 'O canal de denúncias não está ativado neste servidor.', ephemeral: true });
             return;
        }

        const channel = await client.channels.fetch(reportChannel.id);

        if (!channel || channel.type !== ChannelType.GuildText) {
             await interaction.reply({ content: 'O canal de denúncias configurado não é um canal de texto.', ephemeral: true });
             return;
        }

        const tag = interaction.fields.getTextInputValue('report_tag');
        const reason = interaction.fields.getTextInputValue('report_reason');
        const proof = interaction.fields.getTextInputValue('report_proof');
        const user = interaction.user;

        try {
            await interaction.deferReply({ ephemeral: true });

            const thread = await channel.threads.create({
                name: `Denúncia: ${tag}`,
                autoArchiveDuration: 1440, // 24 hours
                type: ChannelType.PrivateThread,
                reason: `Denúncia criada por ${user.tag}`,
            });

            await thread.members.add(user.id);

            const reportEmbed = new EmbedBuilder()
                .setTitle(`Nova Denúncia: ${tag}`)
                .setColor(0xed4245)
                .addFields(
                    { name: 'Autor da Denúncia', value: `<@${user.id}> (ID: ${user.id})` },
                    { name: 'Motivo', value: reason },
                    { name: 'Provas', value: proof || 'Nenhuma prova fornecida' }
                )
                .setTimestamp();
            
            const closeButton = new ButtonBuilder()
                .setCustomId('close_report_thread')
                .setLabel('Fechar Denúncia (Analisado)')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

            await thread.send({ embeds: [reportEmbed], components: [row] });
            
            await interaction.editReply({ content: `Seu tópico de denúncia privado foi criado com sucesso: ${thread.toString()}` });

        } catch (error) {
            console.error('Falha ao criar tópico de denúncia:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao criar seu tópico de denúncia. Por favor, tente novamente.' });
        }
    }

    /**
     * Handles closing the report thread.
     */
    async function handleCloseReportThread(interaction: any) {
        if (!interaction.channel || !interaction.channel.isThread()) return;
        
        // Disable the button
        const disabledRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                ButtonBuilder.from(interaction.component).setDisabled(true).setLabel('Denúncia Fechada')
            );
        
        await interaction.update({ components: [disabledRow] });

        await interaction.channel.send('Denúncia analisada. Este tópico será bloqueado e arquivado em 5 segundos.');

        setTimeout(async () => {
            try {
                await interaction.channel.setLocked(true);
                await interaction.channel.setArchived(true);
            } catch (error) {
                console.error('Falha ao fechar o tópico:', error);
            }
        }, 5000);
    }
    
    /**
     * Logs the bot in using the token from environment variables.
     */
    function startBot() {
        if (process.env.DISCORD_BOT_TOKEN) {
          client.login(process.env.DISCORD_BOT_TOKEN)
            .then(() => console.log('Discord Bot login process initiated.'))
            .catch((error) => {
              console.error('Failed to log in to Discord:', error);
            });
        }
    }
    
    startBot();
}
