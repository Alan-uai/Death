/**
 * @fileOverview This file initializes and manages the Discord bot client,
 * connecting to the Discord Gateway to listen for real-time events.
 */

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { registerGuildCommands } from './discord-commands';

// Ensure necessary environment variables are set
if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('DISCORD_BOT_TOKEN environment variable is not set.');
}

console.log('Initializing Discord Bot...');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // Add other intents your bot might need, e.g., GatewayIntentBits.GuildMessages
  ],
});

/**
 * Event handler for when the client is ready.
 * This is triggered once after the bot successfully logs in.
 */
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord Bot is ready! Logged in as ${readyClient.user.tag}`);
});

/**
 * Event handler for when the bot joins a new guild (server).
 * This is the crucial part that ensures commands are registered automatically.
 */
client.on(Events.GuildCreate, async (guild) => {
  console.log(`Bot has been added to a new guild: ${guild.name} (ID: ${guild.id})`);
  try {
    await registerGuildCommands(guild.id);
    console.log(`Successfully registered commands for the new guild: ${guild.id}`);
  } catch (error) {
    console.error(`Failed to register commands for new guild ${guild.id}:`, error);
  }
});

/**
 * Logs the bot in using the token from environment variables.
 * This establishes the connection to the Discord Gateway.
 */
client.login(process.env.DISCORD_BOT_TOKEN)
  .catch((error) => {
    console.error('Failed to log in to Discord:', error);
    // In a real production environment, you might want to handle this more gracefully,
    // perhaps by attempting to reconnect after a delay.
  });

console.log('Discord Bot login process initiated.');

// We don't need to export anything as this file's purpose is to run the bot client.
