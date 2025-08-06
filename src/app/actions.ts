
'use server';

import { cache } from 'react';
import {
  answerGameQuestions,
  type AnswerGameQuestionsInput,
} from '@/ai/flows/answer-game-questions';
import { getBotStatus } from '@/ai/flows/get-bot-status';
import { getGuildChannels as getGuildChannelsFlow } from '@/ai/flows/get-guild-channels';
import {
  manageSuggestionChannel,
  type ManageSuggestionChannelInput,
  type ManageSuggestionChannelOutput,
} from '@/ai/flows/manage-suggestion-channel';
import { 
  manageReportChannel,
  type ManageReportChannelInput,
  type ManageReportChannelOutput,
} from '@/ai/flows/manage-report-channel';
import { getBotGuilds, type DiscordGuild } from '@/services/discord';
import type { DiscordChannel } from '@/services/discord';
import { registerGuildCommands } from '@/services/discord-commands';
import { db } from '@/lib/firebase-admin';
import { 
    getCustomCommand,
    saveCustomCommand,
    type CustomCommand
} from '@/ai/flows/manage-custom-commands';

export async function askQuestionAction(
  input: AnswerGameQuestionsInput
): Promise<string> {
  try {
    const result = await answerGameQuestions(input);
    return result.answer;
  } catch (error) {
    console.error('Erro na ação askQuestionAction:', error);
    return 'Ocorreu um erro ao buscar uma resposta. Por favor, tente novamente.';
  }
}

export async function getBotStatusAction(): Promise<string> {
  try {
    const result = await getBotStatus();
    return result.status;
  } catch (error) {
    console.error('Erro ao obter o status do bot:', error);
    return 'Offline';
  }
}

export const getGuildChannelsAction = cache(async (
  guildId: string
): Promise<DiscordChannel[]> => {
  try {
    if (!db) {
      console.warn('[Firestore] DB não inicializado. Pulando a busca de canais no cache e buscando na API.');
      const { channels } = await getGuildChannelsFlow({ guildId });
      return channels;
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
    const { channels } = await getGuildChannelsFlow({ guildId });

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
        const guilds = await getBotGuilds();
        return guilds;
    } catch (error) {
        console.error('Erro ao obter servidores do bot:', error);
        return [];
    }
}

export async function registerCommandsAction(guildId: string): Promise<boolean> {
    try {
        await registerGuildCommands(guildId);
        console.log(`Comandos registrados com sucesso para o servidor ${guildId}`);
        return true;
    } catch (error) {
        console.error(`Erro ao registrar comandos para o servidor ${guildId}:`, error);
        return false;
    }
}

export async function manageSuggestionChannelAction(
  input: ManageSuggestionChannelInput
): Promise<ManageSuggestionChannelOutput> {
  try {
    const result = await manageSuggestionChannel(input);
    return result;
  } catch (error) {
    console.error('Erro na ação manageSuggestionChannelAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return {
      success: false,
      message: `Falha ao gerenciar canal de sugestões: ${errorMessage}`,
    };
  }
}

export async function manageReportChannelAction(
  input: ManageReportChannelInput
): Promise<ManageReportChannelOutput> {
  try {
    const result = await manageReportChannel(input);
    return result;
  } catch (error) {
    console.error('Erro na ação manageReportChannelAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return {
      success: false,
      message: `Falha ao gerenciar canal de denúncias: ${errorMessage}`,
    };
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
