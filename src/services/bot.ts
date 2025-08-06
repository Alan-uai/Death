
/**
 * @fileOverview This file initializes and manages the Discord bot client,
 * connecting to the Discord Gateway to listen for real-time events.
 * It also handles saving guild information to Firestore.
 */
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { Client, Events, GatewayIntentBits, Guild } from 'discord.js';
import { registerGuildCommands } from './discord-commands';
import { db } from '@/lib/firebase-admin'; // Using admin SDK for backend operations

// Ensure necessary environment variables are set
if (!process.env.DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN environment variable is not set. Bot will not start.');
} else {
    console.log('Initializing Discord Bot...');
    
    // Create a new client instance
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
      ],
    });
    
    /**
     * Saves guild information, including its channel structure, to Firestore.
     * @param guild The Discord guild object.
     */
    async function saveGuildToFirestore(guild: Guild): Promise<void> {
      try {
        if (!db) {
            console.error('Firestore db instance is not available. Skipping saveGuildToFirestore.');
            return;
        }
        const guildRef = db.collection('servers').doc(guild.id);
        
        // Fetch all channels in the guild
        const channels = await guild.channels.fetch();
        const channelData = channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
        }));
    
        await guildRef.set({
          id: guild.id,
          name: guild.name,
          channels: channelData,
          addedAt: new Date(),
        }, { merge: true }); // Use merge to avoid overwriting on re-adds
    
        console.log(`Successfully saved guild ${guild.name} (ID: ${guild.id}) and its channels to Firestore.`);
      } catch (error) {
        console.error(`Failed to save guild ${guild.id} to Firestore:`, error);
      }
    }
    
    
    /**
     * Event handler for when the client is ready.
     * This is triggered once after the bot successfully logs in.
     */
    client.once(Events.ClientReady, (readyClient) => {
      console.log(`Discord Bot is ready! Logged in as ${readyClient.user.tag}`);
    });
    
    /**
     * Event handler for when the bot joins a new guild (server).
     * This is triggered automatically when the bot is added to a server.
     */
    client.on(Events.GuildCreate, async (guild) => {
      console.log(`Bot has been added to a new guild: ${guild.name} (ID: ${guild.id})`);
      
      // Perform both actions concurrently
      await Promise.all([
        registerGuildCommands(guild.id),
        saveGuildToFirestore(guild)
      ]);
    });
    
    /**
     * Logs the bot in using the token from environment variables.
     * This establishes the connection to the Discord Gateway.
     */
    function startBot() {
        if (process.env.DISCORD_BOT_TOKEN) {
          client.login(process.env.DISCORD_BOT_TOKEN)
            .then(() => console.log('Discord Bot login process initiated.'))
            .catch((error) => {
              console.error('Failed to log in to Discord:', error);
            });
        }
    }
    
    // Start the bot automatically when this module is loaded.
    startBot();
}
