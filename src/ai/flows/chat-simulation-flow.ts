
'use server';
/**
 * @fileOverview A flow to simulate a Discord bot's chat responses.
 *
 * - simulateChatResponse - A function that generates a response based on user input and guild configuration.
 * - ChatSimulationInput - The input type for the simulateChatResponse function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Handlebars from 'handlebars';

// Define the schema for a single wiki entry
const WikiEntrySchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

// Define the schema for the guild configuration
const GuildConfigSchema = z.object({
  botPersonality: z.object({
    customPrompt: z.string(),
  }).optional(),
  wikiData: z.array(WikiEntrySchema).optional(),
}).nullable();


// Define the input schema for the chat simulation
export const ChatSimulationInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
  channelName: z.string().describe('The name of the channel where the message was sent.'),
  guildConfig: GuildConfigSchema.describe('The full configuration object for the guild.'),
});
export type ChatSimulationInput = z.infer<typeof ChatSimulationInputSchema>;


const systemPromptTemplate = `
You are 'Death', a helpful Discord bot simulator. Your purpose is to act EXACTLY as the real bot would, based on the user's message and the provided guild configuration.

Your personality is defined by this instruction:
{{#if guildConfig.botPersonality.customPrompt}}
{{guildConfig.botPersonality.customPrompt}}
{{else}}
You are a friendly and helpful assistant.
{{/if}}

The user, "JogadorUm", sent a message in the channel "#{{channelName}}".

Here is the user's message:
"{{message}}"

Here is a knowledge base (Wiki) with questions and answers. Use it to answer questions if they match.
If the user's question is not in the Wiki, DO NOT invent an answer.
--- WIKI START ---
{{#if guildConfig.wikiData.length}}
{{#each guildConfig.wikiData}}
Q: {{this.question}}
A: {{this.answer}}
---
{{/each}}
{{else}}
No wiki data available.
{{/if}}
--- WIKI END ---

Here is a list of the available settings panels in the dashboard and what they do. Use this information to help users who ask how to configure something.
--- PANELS HELP START ---
- **Editor de Comandos**: Create custom slash commands with custom responses (embeds or interactive containers).
- **Respostas do Bot**: Edit default bot messages like welcome messages, error messages, etc.
- **Gerenciador de Canais**: Enable/disable automatic channel creation for features like suggestions, reports, welcome, and verification.
- **Gerenciador da Wiki**: Add, edit, or remove questions and answers from the bot's knowledge base.
- **Personalidade do Bot**: Change the bot's communication style (e.g., friendly, sarcastic) or write a fully custom personality prompt.
- **Configurações Gerais**: Set specific channels for features to work in and block roles from using the bot.
--- PANELS HELP END ---

Analyze the user's message and the context, then respond appropriately.

- If the user asks a question that is clearly answered in the WIKI, provide the answer from the wiki.
- If the user asks how to do or configure something related to the bot or its features, use the PANELS HELP information to guide them to the correct panel in the dashboard.
- For any other type of message (greetings, general chat), respond naturally according to your personality.
- If you cannot answer, say that you don't know or don't have that information. DO NOT invent information.
`;

const prompt = ai.definePrompt({
    name: 'chatSimulationPrompt',
    input: { schema: ChatSimulationInputSchema },
    prompt: (input) => Handlebars.compile(systemPromptTemplate)(input),
});

// The main flow function
const chatSimulationFlow = ai.defineFlow(
  {
    name: 'chatSimulationFlow',
    inputSchema: ChatSimulationInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await prompt.generate(input);
    return text;
  }
);


/**
 * Simulates a chat response from the bot.
 * @param input The user's message, channel, and guild configuration.
 * @returns A string containing the bot's simulated response.
 */
export async function simulateChatResponse(input: ChatSimulationInput): Promise<string> {
  // Ensure guildConfig is not null and has default values for optional fields if they are missing
  const processedInput = {
    ...input,
    guildConfig: input.guildConfig || {},
  };
  
  if (!processedInput.guildConfig.botPersonality) {
    processedInput.guildConfig.botPersonality = { customPrompt: 'You are a friendly and helpful assistant.' };
  }
  if (!processedInput.guildConfig.wikiData) {
    processedInput.guildConfig.wikiData = [];
  }

  return await chatSimulationFlow(processedInput);
}
