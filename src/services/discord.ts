
import { z } from 'zod';

// Zod schema for a Discord channel
export const DiscordChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.number(), // 0 for text, 2 for voice, 4 for category, 15 for forum
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

type DiscordApiOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: object;
};

async function fetchDiscordApi<T>(
  endpoint: string,
  token: string,
  options: DiscordApiOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options;
  const url = `${DISCORD_API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    Authorization: `Bot ${token}`,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Discord API Error: ${response.status} ${response.statusText}`, {
        url,
        options,
        errorBody: errorText,
    });
    throw new Error(`Failed to fetch from Discord API: ${endpoint}. Status: ${response.status}. Body: ${errorText}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as T;
}

export async function getGuildChannels(
  guildId: string
): Promise<{ channels: DiscordChannel[] }> {
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
  }

  const channels = await fetchDiscordApi<DiscordChannel[]>(
    `/guilds/${guildId}/channels`,
    process.env.DISCORD_BOT_TOKEN
  );

  return { channels };
}

export async function getBotGuilds(): Promise<DiscordGuild[]> {
    if (!process.env.DISCORD_BOT_TOKEN) {
        throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
    }

    const guilds = await fetchDiscordApi<DiscordGuild[]>(
        '/users/@me/guilds',
        process.env.DISCORD_BOT_TOKEN
    );

    return guilds;
}

interface CreateChannelPayload {
    name: string;
    type: number;
    topic?: string;
    permission_overwrites?: {
        id: string;
        type: number; // 0 for role, 1 for member
        allow: string;
        deny: string;
    }[];
    default_reaction_emoji?: {
        emoji_id: string | null;
        emoji_name: string | null;
    };
    available_tags?: {
        name: string;
        emoji_id?: string | null;
        emoji_name?: string | null;
    }[];
}

export async function createGuildChannel(
  guildId: string,
  payload: CreateChannelPayload
): Promise<DiscordChannel> {
   if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
  }

  const newChannel = await fetchDiscordApi<DiscordChannel>(
    `/guilds/${guildId}/channels`,
    process.env.DISCORD_BOT_TOKEN,
    {
      method: 'POST',
      body: payload,
    }
  );

  return newChannel;
}

export async function sendMessage(channelId: string, message: object): Promise<void> {
    if (!process.env.DISCORD_BOT_TOKEN) {
        throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
    }

    await fetchDiscordApi(
        `/channels/${channelId}/messages`,
        process.env.DISCORD_BOT_TOKEN,
        {
            method: 'POST',
            body: message
        }
    );
}


export async function getGuildRoles(guildId: string): Promise<{ id: string, name: string }[]> {
   if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
  }

  const roles = await fetchDiscordApi<{ id: string, name: string }[]>(
    `/guilds/${guildId}/roles`,
    process.env.DISCORD_BOT_TOKEN
  );

  return roles;
}
