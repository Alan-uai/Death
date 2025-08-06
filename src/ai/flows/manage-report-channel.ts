
'use server';

/**
 * @fileOverview A flow to manage a reports channel in a Discord guild.
 *
 * - manageReportChannel - Creates a private reports channel if it doesn't exist.
 * - ManageReportChannelInput - The input type for the manageReportChannel function.
 * - ManageReportChannelOutput - The return type for the manageReportChannel function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getGuildChannels,
  createGuildChannel,
  getGuildRoles,
  DiscordChannel,
} from '@/services/discord';

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
          message: `Um canal de denúncias já existe: #${reportChannel.name}. As denúncias criarão tópicos privados nele.`,
        };
      }

      // Find the @everyone role to set permissions
      const roles = await getGuildRoles(guildId);
      const everyoneRole = roles.find(role => role.name === '@everyone');
      if (!everyoneRole) {
        throw new Error('Não foi possível encontrar o cargo @everyone.');
      }
      
      const newChannel = await createGuildChannel(guildId, {
        name: 'denuncias',
        type: 0, // 0 = Text Channel
        topic: 'Canal para denúncias. Use o comando /denunciar para criar um tópico privado.',
        permission_overwrites: [
          {
            id: everyoneRole.id,
            type: 0, // 0 = Role
            deny: '1024', // 1024 = VIEW_CHANNEL
            allow: '0',
          },
        ],
      });

      return {
        success: true,
        message: `Canal de texto privado #${newChannel.name} criado com sucesso! Use o comando /denunciar para criar tópicos privados.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Falha ao criar canal de denúncias:', errorMessage);
      throw new Error(`Não foi possível criar o canal: ${errorMessage}`);
    }
  }
);
