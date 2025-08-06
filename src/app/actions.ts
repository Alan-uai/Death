'use server';

import { cache } from 'react';
import { db } from '@/lib/firebase-admin';
import type { DiscordChannel, DiscordGuild } from '@/lib/types';
import type { CustomCommand } from '@/lib/types';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function fetchDiscordApi(endpoint: string, token: string) {
    const res = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        console.error(`Discord API Error (${endpoint}): ${res.status}`, await res.text());
        throw new Error(`Failed to fetch from Discord API: ${endpoint}`);
    }
    return res.json();
}

async function getBotGuilds(): Promise<DiscordGuild[]> {
    if (!BOT_TOKEN) {
        throw new Error("DISCORD_BOT_TOKEN is not configured.");
    }
    const res = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
     if (!res.ok) {
        console.error(`Discord API Error (/users/@me/guilds for bot): ${res.status}`, await res.text());
        throw new Error('Failed to fetch bot guilds from Discord API.');
    }
    return res.json();
}

export const getManageableGuildsAction = cache(async (
  accessToken: string
): Promise<Array<DiscordGuild & { bot_present: boolean }>> => {
    try {
        const [userGuilds, botGuilds] = await Promise.all([
            fetchDiscordApi(`/users/@me/guilds`, accessToken),
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
    if (!db) {
      console.warn('Firestore não está inicializado. Retornando array vazio para canais.');
      return [];
    }
  
    const collectionRef = db.collection('discord_channels').doc(guildId).collection('channels');
    const snapshot = await collectionRef.get();

    if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data() as DiscordChannel);
    }
    
    return [];
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
