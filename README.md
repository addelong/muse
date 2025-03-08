# Muse - AI-Powered Writing Assistant

Muse is a minimalist web-based writing app with an AI editor/cowriter. It's designed to get out of the way of the author while providing helpful suggestions from an AI assistant.

## Features

- Clean, distraction-free writing interface
- AI suggestions appear on the sides, away from the main text
- Unobtrusive and ephemeral suggestions that fade out if you keep writing
- Dynamic suggestion types based on what the AI thinks would be most helpful
- Multiple suggestions can appear simultaneously when appropriate
- Adjustable "chattiness" level to control how frequently the AI provides suggestions
- Intelligent context management for longer documents
- Secure local storage of your OpenAI API key
- Save your work to a local file
- Open existing text files to continue working on them

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Setting Up Your OpenAI API Key

Muse requires an OpenAI API key to generate suggestions. You can set this up in one of two ways:

### Option 1: Environment Variable

Create a `.env` file in the root directory with the following content:

```
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Option 2: Settings Menu

1. Click the settings icon in the top-right corner of the app
2. Enter your OpenAI API key in the field provided
3. Adjust the "AI Chattiness" slider to control how frequently suggestions appear
4. Click "Save"

Your API key is stored securely in your browser's localStorage and is never sent to our servers.

## How It Works

As you write, the AI assistant will provide suggestions to help improve your writing after you pause typing for a few seconds. These suggestions appear on the left and right sides of the screen and will fade away after a few seconds if you continue writing.

### Key Behaviors

- Suggestions only appear after you stop typing for a few seconds
- The AI will not continuously interrupt you with suggestions
- New suggestions will only be generated after you resume typing and then pause again
- For longer documents, the AI maintains a running summary to provide context-aware suggestions
- The number and frequency of suggestions depend on your chattiness setting

### File Management

- Click the save button (or use the menu) to save your document
  - On modern browsers, a file picker dialog will appear allowing you to choose where to save the file
  - On older browsers, you'll be prompted to enter a filename before downloading
- Click the menu button in the top-left corner to access the file menu
- Use "Open File" to load an existing text document

The AI acts as a world-famous author and editor, providing insights on:

- Style improvements
- Character development
- Plot direction
- Thematic exploration
- Pacing adjustments
- Dialogue enhancement
- Setting enrichment
- Emotional resonance
- Reader engagement
- Structural considerations

## Development

This project uses:

- React with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- OpenAI API for AI suggestions

## License

MIT
