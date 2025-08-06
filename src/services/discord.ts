
import { z } from 'zod';

// Zod schema for a Discord channel
export const DiscordChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.number(), // 0 for text, 2 for voice, 4 for category
});
export type DiscordChannel = z.infer<typeof DiscordChannelSchema>;

// Zod schema for a Discord guild (server)
export const DiscordGuildSchema = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().nullable(),
});
export type DiscordGuild = z.infer<typeof DiscordGuildSchema>;


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
    // No cache to ensure data is always fresh
    cache: 'no-store',
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
  // We must use a bot token to fetch channels for a specific guild.
  // The user's bearer token from OAuth does not have permission for this.
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN is not set. Cannot fetch guild channels.');
    throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
  }

  const channels = await fetchDiscordApi<DiscordChannel[]>(
    `/guilds/${guildId}/channels`,
    process.env.DISCORD_BOT_TOKEN,
    true // This is a Bot token
  );

  return channels;
}

export async function getBotGuilds(): Promise<DiscordGuild[]> {
    if (!process.env.DISCORD_BOT_TOKEN) {
        console.error('DISCORD_BOT_TOKEN is not set. Cannot fetch bot guilds.');
        throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
    }

    const guilds = await fetchDiscordApi<DiscordGuild[]>(
        '/users/@me/guilds',
        process.env.DISCORD_BOT_TOKEN,
        true // This is a Bot token
    );

    return guilds;
}
