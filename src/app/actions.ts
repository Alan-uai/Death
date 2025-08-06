'use server';

import { cache } from 'react';
import { db } from '@/lib/firebase-admin';
import type { DiscordChannel, DiscordGuild } from '@/lib/types';
import type { CustomCommand } from '@/lib/types';

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';


export const getGuildChannelsAction = cache(async (
  guildId: string
): Promise<DiscordChannel[]> => {
  try {
    const response = await fetch(`${DISCORD_API_BASE_URL}/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });
    
    if (!response.ok) {
        console.error(`Erro ao buscar canais para o servidor ${guildId} na API do Discord. Status: ${response.status}`);
        return [];
    }

    const channels = await response.json() as DiscordChannel[];
    return channels;

  } catch (error) {
    console.error(`Erro ao obter canais para o servidor ${guildId}:`, error);
    return [];
  }
});


export async function getBotGuildsAction(): Promise<DiscordGuild[]> {
    try {
        if (!process.env.DISCORD_BOT_TOKEN) {
            throw new Error('Server configuration error: DISCORD_BOT_TOKEN is not set.');
        }

        const response = await fetch(`${DISCORD_API_BASE_URL}/users/@me/guilds`, {
             headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from Discord API. Status: ${response.status}`);
        }

        const guilds = await response.json();
        return guilds as DiscordGuild[];

    } catch (error) {
        console.error('Erro ao obter servidores do bot:', error);
        return [];
    }
}

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
