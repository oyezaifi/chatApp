import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { supabase } from './supabase';
import type { Model, Message } from '../types';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  models: router({
    getAvailable: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch models: ${error.message}`);
      }

      return data as Model[];
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

        // Generate AI response (stub for now)
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

        return data as Message[];
      }),
  }),
});

// Simple AI response generator (stub)
async function generateAIResponse(prompt: string, modelTag: string): Promise<string> {
  // Check if OpenAI API key is available
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelTag,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return `Error calling OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Fallback echo response
  return `You said: "${prompt}" (using model: ${modelTag})`;
}

export type AppRouter = typeof appRouter;
