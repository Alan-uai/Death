
'use server';

/**
 * @fileOverview A flow to get a Discord guild's channels.
 *
 * - getGuildChannels - A function that returns a list of channels for a guild.
 * - GetGuildChannelsInput - The input type for the getGuildChannels function.
 * - GetGuildChannelsOutput - The return type for the getGuildChannels function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getGuildChannels as getChannelsFromDiscord,
  DiscordChannel,
  DiscordChannelSchema,
} from '@/services/discord';

const GetGuildChannelsInputSchema = z.object({
  guildId: z.string().describe('The ID of the Discord guild (server).'),
});
export type GetGuildChannelsInput = z.infer<
  typeof GetGuildChannelsInputSchema
>;

const GetGuildChannelsOutputSchema = z.object({
  channels: z.array(DiscordChannelSchema).describe('The list of channels in the guild.'),
});
export type GetGuildChannelsOutput = z.infer<
  typeof GetGuildChannelsOutputSchema
>;

export async function getGuildChannels(
  input: GetGuildChannelsInput
): Promise<GetGuildChannelsOutput> {
  return getGuildChannelsFlow(input);
}

const getGuildChannelsFlow = ai.defineFlow(
  {
    name: 'getGuildChannelsFlow',
    inputSchema: GetGuildChannelsInputSchema,
    outputSchema: GetGuildChannelsOutputSchema,
  },
  async ({ guildId }) => {
    const channels = await getChannelsFromDiscord(guildId);
    return { channels };
  }
);
