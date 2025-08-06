'use server';

import { cache } from 'react';
import { db } from '@/lib/firebase-admin';
import type { DiscordChannel, DiscordGuild } from '@/lib/types';
import type { CustomCommand } from '@/lib/types';

const BOT_API_BASE_URL = process.env.BOT_API_URL || 'https://deathbot-o2pa.onrender.com';

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
    
    // Se não houver no cache, não faremos mais a chamada para a API do Discord aqui.
    // A criação de canais e o salvamento serão tratados pelo bot.
    return [];
});


export async function getManageableGuildsAction(accessToken: string): Promise<DiscordGuild[]> {
    try {
        const response = await fetch(`${BOT_API_BASE_URL}/api/guilds`, {
             headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            console.error('Failed to fetch from Bot API.', await response.text());
            throw new Error(`Failed to fetch from Bot API. Status: ${response.status}`);
        }

        const guilds = await response.json();
        return guilds as DiscordGuild[];

    } catch (error) {
        console.error('Erro ao obter servidores gerenciáveis do bot:', error);
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
