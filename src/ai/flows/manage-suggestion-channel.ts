
'use server';

/**
 * @fileOverview A flow to manage a suggestions channel in a Discord guild.
 *
 * - manageSuggestionChannel - Creates a suggestion channel if it doesn't exist.
 * - ManageSuggestionChannelInput - The input type for the manageSuggestionChannel function.
 * - ManageSuggestionChannelOutput - The return type for the manageSuggestionChannel function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getGuildChannels,
  createGuildChannel,
  DiscordChannel,
} from '@/services/discord';

const ManageSuggestionChannelInputSchema = z.object({
  guildId: z.string().describe('The ID of the Discord guild (server).'),
  enable: z.boolean().describe('Whether to enable or disable the feature.'),
});
export type ManageSuggestionChannelInput = z.infer<
  typeof ManageSuggestionChannelInputSchema
>;

const ManageSuggestionChannelOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  message: z.string().describe('A message detailing the result.'),
});
export type ManageSuggestionChannelOutput = z.infer<
  typeof ManageSuggestionChannelOutputSchema
>;

export async function manageSuggestionChannel(
  input: ManageSuggestionChannelInput
): Promise<ManageSuggestionChannelOutput> {
  return manageSuggestionChannelFlow(input);
}

const manageSuggestionChannelFlow = ai.defineFlow(
  {
    name: 'manageSuggestionChannelFlow',
    inputSchema: ManageSuggestionChannelInputSchema,
    outputSchema: ManageSuggestionChannelOutputSchema,
  },
  async ({ guildId, enable }) => {
    if (!enable) {
      // Logic to disable or delete the channel could be added here in the future.
      return {
        success: true,
        message: 'A funcionalidade de sugestões foi desativada.',
      };
    }

    try {
      const { channels } = await getGuildChannels({ guildId });
      const suggestionChannelNames = ['sugestoes', 'sugestões', 'suggestions'];

      const existingChannel = channels.find((channel: DiscordChannel) =>
        suggestionChannelNames.includes(channel.name.toLowerCase())
      );

      if (existingChannel) {
        return {
          success: true,
          message: `Um canal de sugestões já existe: #${existingChannel.name}`,
        };
      }

      // Channel doesn't exist, create it as a Forum channel.
      const newChannel = await createGuildChannel(guildId, {
        name: 'sugestoes',
        type: 15, // 15 = Forum Channel
        topic: 'Envie suas sugestões para a comunidade aqui! Reaja com 👍 para apoiar.',
        // The Discord API only supports one default reaction emoji upon creation.
        default_reaction_emoji: {
          emoji_id: null,
          emoji_name: '👍',
        },
        available_tags: [
            { name: 'Aprovada', emoji_name: '✅' },
            { name: 'Rejeitada', emoji_name: '❌' },
            { name: 'Em Análise', emoji_name: '👀' }
        ],
      });

      // To add a second reaction (e.g., 👎), a bot would need to listen to
      // ThreadCreate events and add the reaction programmatically.
      // For this prototype, one default reaction is a good starting point.
      
      return {
        success: true,
        message: `Canal de fórum #${newChannel.name} criado com sucesso!`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Falha ao criar canal de sugestões:', errorMessage);
      throw new Error(`Não foi possível criar o canal: ${errorMessage}`);
    }
  }
);
