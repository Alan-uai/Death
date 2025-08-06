
'use server';

/**
 * @fileOverview Manages custom commands and responses in Firestore.
 *
 * - saveCustomCommand - Saves or updates a custom command configuration.
 * - getCustomCommand - Retrieves a custom command configuration.
 * - CustomCommand - The type for a custom command object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';

const CustomCommandSchema = z.object({
  id: z.string().describe('The unique identifier for the command (e.g., "q-and-a", "suggest-build", or a new command name).'),
  name: z.string().describe('The display name of the command.'),
  description: z.string().describe('A short description of what the command does.'),
  responseType: z.enum(['container', 'embed']).describe('The format of the bot\'s response.'),
  response: z.object({
    container: z.string().optional().describe('The response text for the "container" type.'),
    embed: z.object({
      title: z.string().optional().describe('The title for the "embed" type response.'),
      description: z.string().optional().describe('The description for the "embed" type response.'),
    }).optional(),
  }).describe('The response content, varying by responseType.'),
});

export type CustomCommand = z.infer<typeof CustomCommandSchema>;

const customCommandsCollection = db?.collection('custom_commands');

export const saveCustomCommand = ai.defineFlow(
  {
    name: 'saveCustomCommand',
    inputSchema: CustomCommandSchema,
    outputSchema: z.void(),
  },
  async (command) => {
    if (!customCommandsCollection) {
      throw new Error('Firestore não está inicializado. Verifique as configurações do Firebase Admin.');
    }
    
    // For new commands, the ID might be different from the command name.
    // For existing commands, the ID is fixed (e.g., 'q-and-a').
    await customCommandsCollection.doc(command.id).set(command);
  }
);


export const getCustomCommand = ai.defineFlow(
  {
    name: 'getCustomCommand',
    inputSchema: z.string(), // commandId
    outputSchema: CustomCommandSchema.nullable(),
  },
  async (commandId) => {
    if (!customCommandsCollection) {
      console.warn('Firestore não está inicializado. Retornando null para o comando customizado.');
      return null;
    }
    const docSnap = await customCommandsCollection.doc(commandId).get();

    if (docSnap.exists) {
      return CustomCommandSchema.parse(docSnap.data());
    } else {
      return null;
    }
  }
);
