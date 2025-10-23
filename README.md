# 🤖 AI Chat App

A modern React chat application with AI model selection, built with Supabase, Tailwind CSS, and Google Gemini API.

## ✨ Features

- 🔐 **Authentication** - Email/password signup & login with Supabase
- 🤖 **AI Models** - Select from multiple AI models (Gemini Pro, Flash, etc.)
- 💬 **Real-time Chat** - Interactive chat interface with message history
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Mobile-friendly design
- ⚡ **Fast** - Built with Vite and modern React

## 🚀 Quick Setup (3 Commands)

```bash
# 1. Install dependencies
npm install

# 2. Add your API keys to .env
cp env.example .env

# 3. Start the app
npm run dev
```

## 🔧 Configuration

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Google Gemini API key

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, tRPC
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Build**: Vite

## 📁 Project Structure

```
src/
├── components/ui/     # Reusable UI components
├── features/
│   ├── auth/         # Authentication logic
│   ├── chat/         # Chat interface
│   └── models/       # AI model selection
├── lib/              # Utilities & configurations
└── types/            # TypeScript definitions
```

## 🎯 Usage

1. **Sign up/Login** with your email
2. **Select an AI model** from the dropdown
3. **Start chatting** with your chosen AI
4. **Toggle dark mode** for your preference

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ using React, Supabase, and Tailwind CSS