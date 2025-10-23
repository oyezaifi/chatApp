import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { supabase } from './src/lib/supabase.js';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple echo chat - no API key needed
console.log('Running in simple echo mode - no API key required');

// Middleware
app.use(cors());
app.use(express.json());

// Simple tRPC-like router for now
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

const appRouter = router({
  models: router({
    getAvailable: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch models: ${error.message}`);
      }

      return data;
    }),
  }),

  chat: router({
    send: publicProcedure
      .input(z.object({
        modelTag: z.string(),
        prompt: z.string(),
        userId: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Save user message
        const { data: userMessage, error: userError } = await supabase
          .from('messages')
          .insert({
            user_id: input.userId,
            model_tag: input.modelTag,
            role: 'user',
            content: input.prompt,
          })
          .select()
          .single();

        if (userError) {
          throw new Error(`Failed to save user message: ${userError.message}`);
        }

        // Generate AI response (simple echo)
        const aiResponse = await generateAIResponse(input.prompt, input.modelTag);

        // Save AI response
        const { data: aiMessage, error: aiError } = await supabase
          .from('messages')
          .insert({
            user_id: input.userId,
            model_tag: input.modelTag,
            role: 'assistant',
            content: aiResponse,
          })
          .select()
          .single();

        if (aiError) {
          throw new Error(`Failed to save AI message: ${aiError.message}`);
        }

        return {
          userMessage,
          aiMessage,
        };
      }),

    history: publicProcedure
      .input(z.object({
        userId: z.string(),
        modelTag: z.string().optional(),
      }))
      .query(async ({ input }) => {
        let query = supabase
          .from('messages')
          .select('*')
          .eq('user_id', input.userId)
          .order('created_at', { ascending: true });

        if (input.modelTag) {
          query = query.eq('model_tag', input.modelTag);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch chat history: ${error.message}`);
        }

        return data;
      }),
  }),
});

// Simple AI response generator (echo back user input)
async function generateAIResponse(prompt, modelTag) {
  // Simple echo response - just return what the user said
  return `You said: ${prompt}`;
}

// tRPC endpoint
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Simple echo mode enabled - AI will echo back your messages');
});
