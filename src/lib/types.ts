
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

export const DiscordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().nullable(),
});
export type DiscordUser = z.infer<typeof DiscordUserSchema>;

// Zod schema for a custom command
export const CustomCommandSchema = z.object({
  id: z.string().min(1, 'O ID do comando é obrigatório.'),
  name: z.string().min(1, 'O nome do comando é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  responseType: z.enum(['container', 'embed']),
  response: z.object({
    container: z.string().optional(),
    embed: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
  }),
});
export type CustomCommand = z.infer<typeof CustomCommandSchema>;
