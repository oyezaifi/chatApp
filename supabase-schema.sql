-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_tag TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_model_tag ON messages(model_tag);

-- Row Level Security policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public access to models
CREATE POLICY "Anyone can view models" ON models
  FOR SELECT USING (true);

-- Insert some default models
INSERT INTO models (tag, name, description) VALUES
  ('gpt-4o', 'GPT-4o', 'OpenAI GPT-4o model'),
  ('gpt-4o-mini', 'GPT-4o Mini', 'OpenAI GPT-4o Mini model'),
  ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI GPT-3.5 Turbo model'),
  ('claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'Anthropic Claude 3.5 Sonnet model'),
  ('claude-3-haiku', 'Claude 3 Haiku', 'Anthropic Claude 3 Haiku model')
ON CONFLICT (tag) DO NOTHING;
