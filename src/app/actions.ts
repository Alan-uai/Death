
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
    console.error('Error in askQuestionAction:', error);
    return 'An error occurred while fetching an answer. Please try again.';
  }
}

export async function suggestBuildAction(
  input: SuggestInGameBuildInput
): Promise<{ buildSuggestion: string; reasoning: string }> {
  try {
    const result = await suggestInGameBuild(input);
    return result;
  } catch (error) {
    console.error('Error in suggestBuildAction:', error);
    return {
      buildSuggestion: 'Could not generate a build suggestion.',
      reasoning: 'An error occurred while processing the request. Please try again.',
    };
  }
}

export async function getBotStatusAction(): Promise<string> {
  try {
    const result = await getBotStatus();
    return result.status;
  } catch (error) {
    console.error('Error getting bot status:', error);
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
          console.log(`[Firestore] Found channels for guild ${guildId} in cache.`);
          return data.channels as DiscordChannel[];
        }
      }
    } else {
        console.warn('[Firestore] DB not initialized. Skipping cache lookup for channels.')
    }
    
    console.log(`[Discord API] Channels for guild ${guildId} not in Firestore cache. Fetching from API.`);
    const { channels } = await getGuildChannels({ guildId });

    if (db && channels.length > 0) {
        console.log(`[Firestore] Saving fetched channels for guild ${guildId} to cache.`);
        const guildDocRef = db.collection('servers').doc(guildId);
        await guildDocRef.set({
            id: guildId,
            channels: channels,
            refreshedAt: new Date(),
        }, { merge: true });
    }

    return channels;

  } catch (error) {
    console.error(`Error getting guild channels for guild ${guildId}:`, error);
    return [];
  }
});

export async function getBotGuildsAction(): Promise<DiscordGuild[]> {
    try {
        const guilds = await getBotGuilds();
        return guilds;
    } catch (error) {
        console.error('Error getting bot guilds:', error);
        return [];
    }
}

export async function registerCommandsAction(guildId: string): Promise<boolean> {
    try {
        await registerGuildCommands(guildId);
        console.log(`Successfully registered commands for guild ${guildId}`);
        return true;
    } catch (error) {
        console.error(`Error registering commands for guild ${guildId}:`, error);
        return false;
    }
}
