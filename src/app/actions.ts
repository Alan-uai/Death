
'use server';

import { cache } from 'react';
import {
  answerGameQuestions,
  type AnswerGameQuestionsInput,
} from '@/ai/flows/answer-game-questions';
import { getBotStatus } from '@/ai/flows/get-bot-status';
import {
  suggestInGameBuild,
  type SuggestInGameBuildInput,
} from '@/ai/flows/suggest-in-game-build';
import { getGuildChannels } from '@/ai/flows/get-guild-channels';
import { getBotGuilds, type DiscordGuild } from '@/services/discord';
import type { DiscordChannel } from '@/services/discord';
import { registerGuildCommands } from '@/services/discord-commands';
import { db } from '@/lib/firebase-admin';

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

export async function suggestBuildAction(
  input: SuggestInGameBuildInput
): Promise<{ buildSuggestion: string; reasoning: string }> {
  try {
    const result = await suggestInGameBuild(input);
    return result;
  } catch (error) {
    console.error('Erro na ação suggestBuildAction:', error);
    return {
      buildSuggestion: 'Não foi possível gerar uma sugestão de build.',
      reasoning: 'Ocorreu um erro ao processar a solicitação. Por favor, tente novamente.',
    };
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
    if (db) {
      const guildDocRef = db.collection('servers').doc(guildId);
      const guildDoc = await guildDocRef.get();

      if (guildDoc.exists) {
        const data = guildDoc.data();
        if (data && data.channels) {
          console.log(`[Firestore] Canais encontrados para o servidor ${guildId} no cache.`);
          return data.channels as DiscordChannel[];
        }
      }
    } else {
        console.warn('[Firestore] DB não inicializado. Pulando a busca de canais no cache.')
    }
    
    console.log(`[API Discord] Canais para o servidor ${guildId} não encontrados no cache do Firestore. Buscando na API.`);
    const { channels } = await getGuildChannels({ guildId });

    if (db && channels.length > 0) {
        console.log(`[Firestore] Salvando canais buscados para o servidor ${guildId} no cache.`);
        const guildDocRef = db.collection('servers').doc(guildId);
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
