
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
import { getCustomCommand } from './manage-custom-commands';

const AnswerGameQuestionsInputSchema = z.object({
  question: z.string().describe('A pergunta sobre o jogo.'),
  // Adicione mais campos de contexto se necessário, como o nome de usuário.
  // username: z.string().describe('O nome do usuário que fez a pergunta'),
});
export type AnswerGameQuestionsInput = z.infer<typeof AnswerGameQuestionsInputSchema>;

const AnswerGameQuestionsOutputSchema = z.object({
  answer: z.string().describe('A resposta para a pergunta.'),
});
export type AnswerGameQuestionsOutput = z.infer<typeof AnswerGameQuestionsOutputSchema>;

export async function answerGameQuestions(input: AnswerGameQuestionsInput): Promise<AnswerGameQuestionsOutput> {
  return answerGameQuestionsFlow(input);
}

const defaultPrompt = `Você é um chatbot em um servidor do Discord que responde a perguntas sobre um videogame quando um usuário o @menciona.

Pergunta: {{{question}}}
Resposta: `;

const prompt = ai.definePrompt({
  name: 'answerGameQuestionsPrompt',
  input: {schema: AnswerGameQuestionsInputSchema},
  output: {schema: AnswerGameQuestionsOutputSchema},
  prompt: `Você é um chatbot em um servidor do Discord que responde a perguntas sobre um videogame quando um usuário o @menciona.
  
  {{{prompt}}}
  `,
});

const answerGameQuestionsFlow = ai.defineFlow(
  {
    name: 'answerGameQuestionsFlow',
    inputSchema: AnswerGameQuestionsInputSchema,
    outputSchema: AnswerGameQuestionsOutputSchema,
  },
  async (input) => {
    // 1. Verificar se existe uma resposta customizada
    const customCommand = await getCustomCommand('q-and-a');
    
    let finalPrompt = defaultPrompt;

    if (customCommand?.responseType === 'embed' && customCommand.response?.embed?.description) {
        // Se a resposta customizada for um embed, usamos sua descrição como o prompt.
        finalPrompt = customCommand.response.embed.description;
    } else if (customCommand?.responseType === 'container' && customCommand.response?.container) {
        // Se for container, usamos o texto do container.
        finalPrompt = customCommand.response.container;
    }

    // 2. Gerar a resposta da IA.
    const llmResponse = await ai.generate({
        prompt: `Instrução: ${finalPrompt} \n Pergunta do Usuário: "${input.question}" \n Responda à pergunta do usuário baseado na instrução.`
    });
    const answer = llmResponse.text;

    // 3. Formatar a resposta final usando o template (se houver)
    let finalAnswer = answer;
    if (customCommand?.response?.embed?.description) {
      finalAnswer = customCommand.response.embed.description
        .replace(/{{question}}/g, input.question)
        .replace(/{{answer}}/g, answer);
    } else if (customCommand?.response?.container) {
        finalAnswer = customCommand.response.container
        .replace(/{{question}}/g, input.question)
        .replace(/{{answer}}/g, answer);
    }

    return { answer: finalAnswer };
  }
);
