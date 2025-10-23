import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { useAuth } from '../auth/AuthContext';
import { ModelSelector } from '../models/ModelSelector';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LogOut, Moon, Sun, Bot, MessageSquare } from 'lucide-react';
import type { Message } from '../../types';

export function ChatInterface() {
  const { user, signOut } = useAuth();
  const [selectedModel, setSelectedModel] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a saved preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const sendMessageMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.userMessage, data.aiMessage]);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  const { data: chatHistory, isLoading } = trpc.chat.history.useQuery(
    {
      userId: user?.id || '',
      modelTag: selectedModel,
    },
    {
      enabled: !!user?.id && !!selectedModel,
    }
  );

  useEffect(() => {
    if (chatHistory) setMessages(chatHistory);
  }, [chatHistory, selectedModel]);

  const handleSendMessage = async (content: string) => {
    if (!user?.id || !selectedModel) return;
    try {
      await sendMessageMutation.mutateAsync({
        userId: user.id,
        modelTag: selectedModel,
        prompt: content,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (!user) return null;

  return (
    <div
      className={`relative h-screen w-screen flex flex-col overflow-hidden transition-all duration-500 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100'
          : 'bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 text-gray-900'
      }`}
    >
      {/* Background animation */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-25 animate-blob ${darkMode ? 'bg-blue-900' : 'bg-blue-200'}`}></div>
        <div className={`absolute top-40 right-10 w-72 h-72 rounded-full blur-3xl opacity-25 animate-blob animation-delay-2000 ${darkMode ? 'bg-purple-900' : 'bg-purple-200'}`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full blur-3xl opacity-25 animate-blob animation-delay-4000 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-200'}`}></div>
      </div>

      {/* Header */}
      <div className="relative z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Chat
              </h1>
            </div>
            <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
          </div>

          {/* Theme toggle + Signout */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={`rounded-xl transition-all duration-200 hover:scale-105 ${
                darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-200 text-indigo-600 border border-gray-300'
              }`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={`rounded-xl transition-all duration-200 hover:scale-105 ${
                darkMode
                  ? 'bg-transparent hover:bg-red-900/20 hover:text-red-400 text-gray-100'
                  : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {!selectedModel ? (
          <div className="flex items-center justify-center h-full p-4">
            <Card
              className={`p-8 text-center backdrop-blur-xl shadow-2xl max-w-md transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-800/80 text-gray-100'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                  darkMode
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                    : 'bg-gradient-to-br from-blue-400 to-purple-400'
                }`}
              >
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h2
                className={`text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode
                    ? 'from-blue-600 to-purple-600'
                    : 'from-blue-500 to-purple-500'
                }`}
              >
                Welcome to AI Chat!
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please select a model to start your conversation
              </p>
            </Card>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Loading messages...
              </div>
            </div>
          </div>
        ) : messages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <Card
              className={`p-8 text-center backdrop-blur-xl shadow-2xl max-w-md transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-800/80 text-gray-100'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg animate-pulse ${
                  darkMode
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                    : 'bg-gradient-to-br from-blue-400 to-purple-400'
                }`}
              >
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2
                className={`text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode
                    ? 'from-blue-600 to-purple-600'
                    : 'from-blue-500 to-purple-500'
                }`}
              >
                Start a conversation
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Send your first message to begin chatting with {selectedModel}
              </p>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages?.map((message: Message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex gap-3 p-4 animate-slideUp">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {selectedModel && (
        <div className="relative z-10">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!selectedModel || sendMessageMutation.isPending}
            loading={sendMessageMutation.isPending}
          />
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
