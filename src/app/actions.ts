'use server';

import { cache } from 'react';
import { db } from '@/lib/firebase-admin';
import type { DiscordChannel, DiscordGuild, DiscordUser, DiscordRole } from '@/lib/types';
import type { CustomCommand } from '@/lib/types';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// --- Bot API Secure Calls ---
const BOT_API_BASE_URL = process.env.BOT_API_URL;
const BOT_API_SECRET = process.env.BOT_API_SECRET;


async function postToBotApi(endpoint: string, body: object) {
    if (!BOT_API_BASE_URL || !BOT_API_SECRET) {
        const errorMsg = 'BOT_API_URL ou BOT_API_SECRET não estão configurados no servidor.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    const response = await fetch(`${BOT_API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BOT_API_SECRET}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let errorMessage = 'Ocorreu um erro desconhecido.';
        try {
            // Tente primeiro obter o texto, pois a resposta pode não ser JSON.
            const errorText = await response.text();
            try {
                // Depois, tente fazer o parse do JSON.
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Se o parse falhar, use o texto bruto como mensagem de erro.
                errorMessage = errorText;
            }
        } catch (e) {
             // Se houver erro ao ler a resposta.
            errorMessage = `Falha ao ler a resposta de erro da API (${response.status} ${response.statusText})`;
        }
        
        console.error(`Falha na API do Bot (${endpoint}):`, errorMessage);
        throw new Error(`Falha na API do Bot: ${errorMessage}`);
    }

    return response.json();
}


export async function saveCommandConfigAction(guildId: string, command: CustomCommand) {
    // Usa o endpoint genérico. A API do bot deve saber como mesclar
    // o campo customCommands na configuração existente.
    const payload = {
        guildId,
        config: {
            // Aninha o comando sob a chave 'customCommands'
            // O bot deve mesclar este objeto no mapa existente.
            customCommands: {
                [command.name]: command
            }
        }
    };
    return postToBotApi('config-generic', payload);
}

export async function saveChannelConfigAction(guildId: string, config: any) {
    // Usando o endpoint genérico. A API do bot deve esperar { channelManagement: ... }
    const payload = {
        guildId,
        config: {
            channelManagement: config
        }
    };
    return postToBotApi('config-generic', payload);
}

export async function saveBotResponseAction(guildId: string, messageId: string, responseData: any) {
    const payload = {
        guildId,
        config: {
            botResponses: {
                [messageId]: responseData
            }
        }
    };
    return postToBotApi('config-generic', payload);
}


export async function saveGenericConfigAction(guildId: string, config: object) {
     // Usando o endpoint genérico. A API do bot deve esperar um objeto de configuração aninhado.
    const payload = {
        guildId,
        config: config
    };
    return postToBotApi('config-generic', payload);
}

export async function setOwnerAction(guildId: string, userId: string) {
    // Usa o endpoint genérico para definir o ownerId.
    const payload = {
        guildId,
        config: {
            ownerId: userId
        }
    };
    return postToBotApi('config-generic', payload);
}


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

export const getCurrentUserAction = cache(async (
    accessToken: string
): Promise<DiscordUser> => {
    return fetchDiscordApi('/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
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

export const getGuildRolesAction = cache(async (
    guildId: string
  ): Promise<DiscordRole[]> => {
      if (!BOT_TOKEN) {
          console.error("DISCORD_BOT_TOKEN is not configured. Cannot fetch roles from API.");
          return [];
      }
      try {
          const roles = await fetchDiscordApi(`/guilds/${guildId}/roles`, {
              headers: { Authorization: `Bot ${BOT_TOKEN}` }
          });
          return roles;
      } catch (error) {
          console.error(`Failed to fetch roles for guild ${guildId} from Discord API:`, error);
          return [];
      }
  });

export const getGuildConfigAction = cache(async (
  guildId: string
): Promise<any | null> => {
   if (!db) {
      console.warn('Firestore não está inicializado. Retornando null para a configuração do servidor.');
      return null;
    }
    const docSnap = await db.collection('guild_configs').doc(guildId).get();

    if (docSnap.exists) {
      return docSnap.data();
    } else {
      return null;
    }
});
