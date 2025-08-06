import { z } from 'zod';

// Zod schema for a Discord channel
export const DiscordChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.number(), // 0 for text, 2 for voice, 4 for category, 15 for forum
});
export type DiscordChannel = z.infer<typeof DiscordChannelSchema>;

// Zod schema for a Discord guild (server)
export const DiscordGuildSchema = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().nullable(),
    permissions: z.string().optional(),
});
export type DiscordGuild = z.infer<typeof DiscordGuildSchema>;

// Zod schema for a custom command
export const CustomCommandSchema = z.object({
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
