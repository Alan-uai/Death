
'use server';

/**
 * @fileOverview Um fluxo para sugerir builds e guias no jogo.
 *
 * - suggestInGameBuild - Uma função que lida com a sugestão de builds no jogo.
 * - SuggestInGameBuildInput - O tipo de entrada para a função suggestInGameBuild.
 * - SuggestInGameBuildOutput - O tipo de retorno para a função suggestInGameBuild.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInGameBuildInputSchema = z.object({
  gameState: z
    .string()
    .describe(
      'O estado atual do jogo, incluindo estatísticas do personagem, inventário e progresso.'
    ),
  playerPreferences: z
    .string()

.describe('As preferências do jogador, incluindo estilo de jogo e objetivos.'),
});
export type SuggestInGameBuildInput = z.infer<typeof SuggestInGameBuildInputSchema>;

const SuggestInGameBuildOutputSchema = z.object({
  buildSuggestion: z.string().describe('A build ou guia sugerido no jogo.'),
  reasoning: z.string().describe('A justificativa por trás da sugestão de build.'),
});
export type SuggestInGameBuildOutput = z.infer<typeof SuggestInGameBuildOutputSchema>;

export async function suggestInGameBuild(input: SuggestInGameBuildInput): Promise<SuggestInGameBuildOutput> {
  return suggestInGameBuildFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInGameBuildPrompt',
  input: {schema: SuggestInGameBuildInputSchema},
  output: {schema: SuggestInGameBuildOutputSchema},
  prompt: `Você é um guia de jogo especialista, adepto a sugerir builds e estratégias no jogo.

  Com base no estado atual do jogo e nas preferências do jogador, sugira uma build ou um guia no jogo.
  Explique sua justificativa por trás da sugestão.

  Estado do Jogo: {{{gameState}}}
  Preferências do Jogador: {{{playerPreferences}}}
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
