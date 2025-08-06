
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
    permissions: z.string().optional(), // Added for filtering manageable guilds
});
export type DiscordGuild = z.infer<typeof DiscordGuildSchema>;

    