'use server';

/**
 * @fileOverview A flow to suggest in-game builds and guides.
 *
 * - suggestInGameBuild - A function that handles the suggestion of in-game builds.
 * - SuggestInGameBuildInput - The input type for the suggestInGameBuild function.
 * - SuggestInGameBuildOutput - The return type for the suggestInGameBuild function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInGameBuildInputSchema = z.object({
  gameState: z
    .string()
    .describe(
      'The current game state, including character stats, inventory, and progress.'
    ),
  playerPreferences: z
    .string()
    .describe('The player preferences, including play style and goals.'),
});
export type SuggestInGameBuildInput = z.infer<typeof SuggestInGameBuildInputSchema>;

const SuggestInGameBuildOutputSchema = z.object({
  buildSuggestion: z.string().describe('The suggested in-game build or guide.'),
  reasoning: z.string().describe('The reasoning behind the build suggestion.'),
});
export type SuggestInGameBuildOutput = z.infer<typeof SuggestInGameBuildOutputSchema>;

export async function suggestInGameBuild(input: SuggestInGameBuildInput): Promise<SuggestInGameBuildOutput> {
  return suggestInGameBuildFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInGameBuildPrompt',
  input: {schema: SuggestInGameBuildInputSchema},
  output: {schema: SuggestInGameBuildOutputSchema},
  prompt: `You are an expert game guide, adept at suggesting in-game builds and strategies.

  Based on the current game state and player preferences, suggest an in-game build or guide.
  Explain your reasoning behind the suggestion.

  Game State: {{{gameState}}}
  Player Preferences: {{{playerPreferences}}}
  `,
});

const suggestInGameBuildFlow = ai.defineFlow(
  {
    name: 'suggestInGameBuildFlow',
    inputSchema: SuggestInGameBuildInputSchema,
    outputSchema: SuggestInGameBuildOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
