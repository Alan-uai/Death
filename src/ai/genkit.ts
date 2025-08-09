
'use server';

import {genkit, Ai} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai: Ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
