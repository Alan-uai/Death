'use server';

import { cache } from 'react';
import { db } from '@/lib/firebase-admin';
import type { DiscordChannel, DiscordGuild } from '@/lib/types';
import type { CustomCommand } from '@/lib/types';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Cached fetch function to avoid rate limits
const fetchDiscordApi = cache(async (endpoint: string, options: RequestInit) => {
    const res = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
        ...options,
        next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) {
        console.error(`Discord API Error (${endpoint}): ${res.status}`, await res.text());
        throw new Error(`Failed to fetch from Discord API: ${endpoint}`);
    }
    return res.json();
});

const getBotGuilds = cache(async (): Promise<DiscordGuild[]> => {
    if (!BOT_TOKEN) {
        throw new Error("DISCORD_BOT_TOKEN is not configured.");
    }
    return fetchDiscordApi(`/users/@me/guilds`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });
});

export const getManageableGuildsAction = cache(async (
  accessToken: string
): Promise<Array<DiscordGuild & { bot_present: boolean }>> => {
    try {
        const [userGuilds, botGuilds] = await Promise.all([
             fetchDiscordApi(`/users/@me/guilds`, { headers: { Authorization: `Bearer ${accessToken}` } }),
            getBotGuilds()
        ]);
        
        const botGuildIds = new Set(botGuilds.map(g => g.id));

        const manageableGuilds = userGuilds
            .filter((guild: any) => (BigInt(guild.permissions) & 0x20n) === 0x20n) // MANAGE_GUILD permission
            .map((guild: DiscordGuild) => ({
                ...guild,
                bot_present: botGuildIds.has(guild.id),
            }));

        return manageableGuilds;
    } catch (error) {
        console.error('Error getting manageable guilds:', error);
        return [];
    }
});


export const getGuildChannelsAction = cache(async (
  guildId: string
): Promise<DiscordChannel[]> => {
    // 1. First, try to get channels from Firestore (the "fast path")
    if (db) {
      try {
        const collectionRef = db.collection('discord_channels').doc(guildId).collection('channels');
        const snapshot = await collectionRef.get();
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => doc.data() as DiscordChannel);
        }
      } catch (error) {
        console.warn('Could not fetch channels from Firestore, falling back to Discord API.', error);
      }
    } else {
        console.warn('Firestore not initialized. Falling back to Discord API.');
    }
    
    // 2. If Firestore is empty or fails, fall back to a direct Discord API call
    console.log(`Fallback: Fetching channels for guild ${guildId} directly from Discord API.`);
    if (!BOT_TOKEN) {
        console.error("DISCORD_BOT_TOKEN is not configured. Cannot fetch channels from API.");
        return [];
    }
    try {
        const channels = await fetchDiscordApi(`/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });
        return channels.filter((c: DiscordChannel) => c.type === 0 || c.type === 15); // Return only text and forum channels
    } catch (error) {
        console.error(`Failed to fetch channels for guild ${guildId} from Discord API:`, error);
        return [];
    }
});

export const getCustomCommandAction = cache(async (
  commandId: string
): Promise<CustomCommand | null> => {
   if (!db) {
      console.warn('Firestore não está inicializado. Retornando null para o comando customizado.');
      return null;
    }
    const docSnap = await db.collection('custom_commands').doc(commandId).get();

    if (docSnap.exists) {
      return docSnap.data() as CustomCommand;
    } else {
      return null;
    }
});
