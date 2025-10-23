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

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('Environment check:');
console.log('GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
console.log('Using API key:', GEMINI_API_KEY ? 'Yes' : 'No');
console.log('API Key (first 10 chars):', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'None');

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

        // Generate AI response using Gemini
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

// AI response generator using Gemini API
async function generateAIResponse(prompt, modelTag) {
  try {
    // Map model tags to actual Gemini model names (using available models)
    const modelName = modelTag === 'gemini-1.5-flash-latest' ? 'gemini-2.5-flash' : 
                     modelTag === 'gemini-1.5-pro-latest' ? 'gemini-2.5-pro' :
                     modelTag === 'gemini-pro-latest' ? 'gemini-pro-latest' : 
                     'gemini-2.5-flash';
    
    console.log(`Calling Gemini API with model: ${modelName}`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Extract the text from the response
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      console.error('No response from Gemini:', JSON.stringify(result));
      return 'Sorry, I could not generate a response. Please try again.';
    }
    
    return aiResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return `Error: ${error.message}. Please check your API key and try again.`;
  }
}

// tRPC endpoint
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini API Key configured: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
