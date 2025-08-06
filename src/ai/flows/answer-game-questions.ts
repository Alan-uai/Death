
'use server';

/**
 * @fileOverview Um agente de IA para responder a perguntas sobre o jogo.
 *
 * - answerGameQuestions - Uma função que lida com as respostas a perguntas sobre o jogo.
 * - AnswerGameQuestionsInput - O tipo de entrada para a função answerGameQuestions.
 * - AnswerGameQuestionsOutput - O tipo de retorno para a função answerGameQuestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGameQuestionsInputSchema = z.object({
  question: z.string().describe('A pergunta sobre o jogo.'),
});
export type AnswerGameQuestionsInput = z.infer<typeof AnswerGameQuestionsInputSchema>;

const AnswerGameQuestionsOutputSchema = z.object({
  answer: z.string().describe('A resposta para a pergunta.'),
});
export type AnswerGameQuestionsOutput = z.infer<typeof AnswerGameQuestionsOutputSchema>;

export async function answerGameQuestions(input: AnswerGameQuestionsInput): Promise<AnswerGameQuestionsOutput> {
  return answerGameQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGameQuestionsPrompt',
  input: {schema: AnswerGameQuestionsInputSchema},
  output: {schema: AnswerGameQuestionsOutputSchema},
  prompt: `Você é um chatbot em um servidor do Discord que responde a perguntas sobre um videogame quando um usuário o @menciona.

  Pergunta: {{{question}}}
  Resposta: `,
});

const answerGameQuestionsFlow = ai.defineFlow(
  {
    name: 'answerGameQuestionsFlow',
    inputSchema: AnswerGameQuestionsInputSchema,
    outputSchema: AnswerGameQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
