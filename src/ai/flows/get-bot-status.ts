
'use server';

/**
 * @fileOverview Um fluxo para obter o status do bot.
 *
 * - getBotStatus - Uma função que retorna o status do bot.
 * - GetBotStatusOutput - O tipo de retorno para a função getBotStatus.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetBotStatusOutputSchema = z.object({
  status: z.string().describe('O status do bot (ex: Online, Offline).'),
});
export type GetBotStatusOutput = z.infer<typeof GetBotStatusOutputSchema>;

export async function getBotStatus(): Promise<GetBotStatusOutput> {
  return getBotStatusFlow();
}

const getBotStatusFlow = ai.defineFlow(
  {
    name: 'getBotStatusFlow',
    inputSchema: z.void(),
    outputSchema: GetBotStatusOutputSchema,
  },
  async () => {
    // Em uma aplicação real, você verificaria o status da conexão com o gateway do Discord ou outros serviços.
    // Para este protótipo, simularemos um status online.
    return {
      status: 'Online',
    };
  }
);
