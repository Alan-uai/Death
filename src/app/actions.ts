
'use server';

import { cache } from 'react';
import { db } from '@/lib/firebase-admin';
import type { DiscordChannel, DiscordGuild } from '@/lib/types';
import { 
    getCustomCommand,
    saveCustomCommand,
    type CustomCommand
} from '@/ai/flows/manage-custom-commands';

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';


export const getGuildChannelsAction = cache(async (
  guildId: string
): Promise<DiscordChannel[]> => {
  try {
    if (!db) {
      console.warn('[Firestore] DB não inicializado. Buscando na API.');
      const response = await fetch(`${DISCORD_API_BASE_URL}/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      });
      if (!response.ok) return [];
      const channels = await response.json();
      return channels as DiscordChannel[];
    }

    const guildDocRef = db.collection('servers').doc(guildId);
    const guildDoc = await guildDocRef.get();

    if (guildDoc.exists) {
      const data = guildDoc.data();
      if (data && data.channels && data.channels.length > 0) {
        console.log(`[Firestore] Canais encontrados para o servidor ${guildId} no cache.`);
        return data.channels as DiscordChannel[];
      }
    }
    
    console.log(`[Discord API] Canais para o servidor ${guildId} não encontrados no cache do Firestore. Buscando na API.`);
    const response = await fetch(`${DISCORD_API_BASE_URL}/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });
    
    if (!response.ok) {
        console.error(`Erro ao buscar canais para o servidor ${guildId} na API do Discord. Status: ${response.status}`);
        return [];
    }

    const channels = await response.json() as DiscordChannel[];

    if (channels.length > 0) {
        console.log(`[Firestore] Salvando ${channels.length} canais buscados para o servidor ${guildId} no cache.`);
        await guildDocRef.set({
            id: guildId,
            channels: channels,
            refreshedAt: new Date(),
        }, { merge: true });
    }

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
  try {
    return await getCustomCommand(commandId);
  } catch (error) {
    console.error(`Erro ao buscar comando customizado '${commandId}':`, error);
    return null;
  }
});

export async function saveCustomCommandAction(
  command: CustomCommand
): Promise<{ success: boolean; message: string }> {
  try {
    await saveCustomCommand(command);
    return {
      success: true,
      message: 'Comando salvo com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao salvar comando customizado:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return {
      success: false,
      message: `Falha ao salvar comando: ${errorMessage}`,
    };
  }
}

    