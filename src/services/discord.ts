
import { z } from 'zod';

// Zod schema for a Discord channel
export const DiscordChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.number(), // 0 for text, 2 for voice, 4 for category
});
export type DiscordChannel = z.infer<typeof DiscordChannelSchema>;

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

async function fetchDiscordApi<T>(
  endpoint: string,
  token: string,
  isBotToken: boolean = true
): Promise<T> {
  const url = `${DISCORD_API_BASE_URL}${endpoint}`;
  const authHeader = isBotToken ? `Bot ${token}` : `Bearer ${token}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Discord API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch from Discord API: ${endpoint}`);
  }

  return response.json() as T;
}

export async function getGuildChannels(
  guildId: string
): Promise<DiscordChannel[]> {
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.warn('DISCORD_BOT_TOKEN is not set. Using client-side token for channels.');
    
    // Fallback for prototyping: try to use client token if bot token is not available
    // This has limitations and is not a production approach.
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('discord_access_token') : null;
    if (accessToken) {
         return fetchDiscordApi<DiscordChannel[]>(
            `/guilds/${guildId}/channels`,
            accessToken,
            false // This is a Bearer token, not a Bot token
        );
    }
    throw new Error('DISCORD_BOT_TOKEN is not set and no client token is available.');
  }

  const channels = await fetchDiscordApi<DiscordChannel[]>(
    `/guilds/${guildId}/channels`,
    process.env.DISCORD_BOT_TOKEN,
    true // This is a Bot token
  );

  return channels;
}
