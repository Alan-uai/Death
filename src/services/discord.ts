
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
  token: string
): Promise<T> {
  const url = `${DISCORD_API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bot ${token}`,
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
    throw new Error('DISCORD_BOT_TOKEN is not set in environment variables.');
  }

  const channels = await fetchDiscordApi<DiscordChannel[]>(
    `/guilds/${guildId}/channels`,
    process.env.DISCORD_BOT_TOKEN
  );

  return channels;
}
