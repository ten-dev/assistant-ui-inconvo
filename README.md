# Assistant UI + Inconvo Integration Demo

A Next.js application demonstrating the integration of [assistant-ui](https://github.com/Yonom/assistant-ui) with [Inconvo AI](https://inconvo.ai/) data analysis tools.

## Overview

This project showcases how to build an AI assistant interface with advanced data analysis capabilities by combining:

- **Assistant UI** - React components for building conversational AI interfaces
- **Inconvo AI SDK** - Data analysis and visualization tools for LLM applications
- **Vercel AI SDK** - Streaming AI responses with tool calling support

## Features

- Chat interface with sidebar and thread management
- Data analyst conversation tools powered by Inconvo
- Interactive charts (bar/line) and tables rendered directly in the chat
- Theme toggle (light/dark mode) with system preference support
- Streaming responses with OpenAI GPT integration

## Key Components

- **Assistant Sidebar** - Resizable panels for chat threads and main content
- **Data Analyst Tools** - Hidden tools that enable data analysis conversations
- **Chart Visualization** - Custom chart components using Recharts
- **Data Tables** - Table rendering with sorting and filtering capabilities

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **AI**: Vercel AI SDK, OpenAI, Assistant UI
- **Data Viz**: Recharts, Tanstack Table
- **State**: Zustand
- **Styling**: Tailwind CSS, next-themes

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:8080](http://localhost:8080) to see the application.

## Environment Variables

Create a `.env.local` file:

```env
# Optional: Assistant Cloud base URL
NEXT_PUBLIC_ASSISTANT_BASE_URL=your_base_url

# OpenAI API key (required for chat functionality)
OPENAI_API_KEY=your_openai_api_key
```

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components/assistant-ui` - Chat UI components
- `/src/components/assistant-ui/tools` - Inconvo tool integrations
- `/src/components/ui` - Reusable UI components (buttons, dialogs, etc.)
- `/src/lib` - Utilities and type definitions

## API Integration

The chat API endpoint (`/api/chat/route.ts`) integrates:
- Frontend tools from assistant-ui
- Inconvo tools for data analysis
- OpenAI GPT models with streaming support

## Learn More

- [Assistant UI Documentation](https://github.com/Yonom/assistant-ui)
- [Inconvo AI Documentation](https://inconvo.ai/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Next.js Documentation](https://nextjs.org/docs)
