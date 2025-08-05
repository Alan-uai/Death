import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-in-game-build.ts';
import '@/ai/flows/answer-game-questions.ts';
import '@/ai/flows/get-bot-status.ts';
import '@/ai/flows/get-guild-channels.ts';
