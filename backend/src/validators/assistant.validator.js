import { z } from 'zod';
import { cleanText } from '../utils/sanitize.js';

const text = (max) => z.string().transform(cleanText).pipe(z.string().max(max));

export const assistantChatSchema = z.object({
  question: text(500).pipe(z.string().min(1, 'Please enter a question')),
  language: z.enum(['en', 'hi']).default('en'),
  context: text(6000).default(''),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: text(800) }))
    .max(6)
    .default([]),
});
