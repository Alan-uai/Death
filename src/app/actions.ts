
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
    // For this example, we'll return "Online" if the flow executes successfully.
    // A real implementation might involve more complex logic to check the bot's heartbeat.
    await getBotStatus();
    return 'Online';
  } catch (error) {
    console.error('Error getting bot status:', error);
    return 'Offline';
  }
}
