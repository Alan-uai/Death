'use server';

/**
 * @fileOverview A flow to get the bot's status.
 *
 * - getBotStatus - A function that returns the bot's status.
 * - GetBotStatusOutput - The return type for the getBotStatus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetBotStatusOutputSchema = z.object({
  status: z.string().describe('The status of the bot (e.g., Online, Offline).'),
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
    // In a real application, you would check the connection status to Discord's gateway or other services.
    // For this prototype, we'll simulate an online status.
    return {
      status: 'Online',
    };
  }
);
