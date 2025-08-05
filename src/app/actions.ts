
'use server';

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

export async function getGuildChannelsAction(
  guildId: string
): Promise<DiscordChannel[]> {
  try {
    // First, try to get channels from Firestore
    const guildDocRef = db.collection('guilds').doc(guildId);
    const guildDoc = await guildDocRef.get();

    if (guildDoc.exists && guildDoc.data()?.channels) {
      console.log(`[Firestore] Found channels for guild ${guildId} in cache.`);
      return guildDoc.data()?.channels as DiscordChannel[];
    }
    
    // If not in Firestore, fetch from Discord API as a fallback
    console.log(`[Discord API] Channels for guild ${guildId} not in Firestore. Fetching from API.`);
    const { channels } = await getGuildChannels({ guildId });
    return channels;

  } catch (error) {
    console.error('Error getting guild channels:', error);
    // Return a default structure on error to avoid crashing the UI
    return [
        { id: 'welcome', name: 'welcome', type: 0 },
        { id: 'q-and-a', name: 'q-and-a', type: 0 },
        { id: 'build-suggestions', name: 'build-suggestions', type: 0 },
    ];
  }
}

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
