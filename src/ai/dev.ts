import { config } from 'dotenv';
config();

// Start the bot gateway
import '@/services/bot.ts';

import '@/ai/flows/suggest-in-game-build.ts';
import '@/ai/flows/answer-game-questions.ts';
import '@/ai/flows/get-bot-status.ts';
import '@/ai/flows/get-guild-channels.ts';
