
'use server';

/**
 * @fileOverview A flow to manage a reports channel in a Discord guild.
 *
 * - manageReportChannel - Creates a public reports channel with a button to create a report.
 * - ManageReportChannelInput - The input type for the manageReportChannel function.
 * - ManageReportChannelOutput - The return type for the manageReportChannel function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getGuildChannels,
  createGuildChannel,
  DiscordChannel,
  sendMessage,
} from '@/services/discord';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const ManageReportChannelInputSchema = z.object({
  guildId: z.string().describe('The ID of the Discord guild (server).'),
  enable: z.boolean().describe('Whether to enable or disable the feature.'),
});
export type ManageReportChannelInput = z.infer<
  typeof ManageReportChannelInputSchema
>;

const ManageReportChannelOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  message: z.string().describe('A message detailing the result.'),
  channelId: z.string().optional().describe('The ID of the created or found channel.'),
});
export type ManageReportChannelOutput = z.infer<
  typeof ManageReportChannelOutputSchema
>;

export async function manageReportChannel(
  input: ManageReportChannelInput
): Promise<ManageReportChannelOutput> {
  return manageReportChannelFlow(input);
}

const manageReportChannelFlow = ai.defineFlow(
  {
    name: 'manageReportChannelFlow',
    inputSchema: ManageReportChannelInputSchema,
    outputSchema: ManageReportChannelOutputSchema,
  },
  async ({ guildId, enable }) => {
    if (!enable) {
      return {
        success: true,
        message: 'A funcionalidade de denúncias foi desativada.',
      };
    }

    try {
      const { channels } = await getGuildChannels({ guildId });
      const reportChannelNames = ['denuncias', 'denúncias', 'reports'];

      let reportChannel = channels.find((channel: DiscordChannel) =>
        reportChannelNames.includes(channel.name.toLowerCase())
      );

      if (reportChannel) {
        return {
          success: true,
          message: `O canal de denúncias #${reportChannel.name} já existe.`,
          channelId: reportChannel.id,
        };
      }
      
      const newChannel = await createGuildChannel(guildId, {
        name: 'denuncias',
        type: 0, // 0 = Text Channel
        topic: 'Clique no botão abaixo para abrir um tópico de denúncia privado.',
      });

      // Create the button
      const openReportButton = new ButtonBuilder()
            .setCustomId('open_report_modal')
            .setLabel('Abrir Denúncia')
            .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(openReportButton);
      
      // Send message with the button to the newly created channel
      await sendMessage(newChannel.id, {
        embeds: [{
          title: 'Sistema de Denúncias',
          description: 'Para criar uma denúncia de forma anônima e segura, clique no botão abaixo. Um tópico privado, visível apenas para você e a moderação, será criado.',
          color: 0xed4245, // Red color
        }],
        components: [row.toJSON()],
      });

      return {
        success: true,
        message: `Canal de texto público #${newChannel.name} criado com sucesso!`,
        channelId: newChannel.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Falha ao criar canal de denúncias:', errorMessage);
      throw new Error(`Não foi possível criar o canal: ${errorMessage}`);
    }
  }
);
