'use server';

/**
 * @fileOverview An AI agent for answering questions about the game.
 *
 * - answerGameQuestions - A function that handles answering questions about the game.
 * - AnswerGameQuestionsInput - The input type for the answerGameQuestions function.
 * - AnswerGameQuestionsOutput - The return type for the answerGameQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGameQuestionsInputSchema = z.object({
  question: z.string().describe('The question about the game.'),
});
export type AnswerGameQuestionsInput = z.infer<typeof AnswerGameQuestionsInputSchema>;

const AnswerGameQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerGameQuestionsOutput = z.infer<typeof AnswerGameQuestionsOutputSchema>;

export async function answerGameQuestions(input: AnswerGameQuestionsInput): Promise<AnswerGameQuestionsOutput> {
  return answerGameQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGameQuestionsPrompt',
  input: {schema: AnswerGameQuestionsInputSchema},
  output: {schema: AnswerGameQuestionsOutputSchema},
  prompt: `You are a chatbot in a Discord server that answers questions about a video game when a user @mentions you.

  Question: {{{question}}}
  Answer: `,
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
