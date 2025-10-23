export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Model {
  id: string;
  tag: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  model_tag: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  model_tag: string;
  created_at: string;
  updated_at: string;
}
