
import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // The model is optional and can be configured per-generation.
});

// If you're using a different model, you can configure it here.
// For example, to use Gemini 2.0 Flash:
// configureGenkit({
//   plugins: [googleAI()],
//   model: 'googleai/gemini-2.0-flash',
// });

    