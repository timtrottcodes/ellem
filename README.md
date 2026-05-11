# Ellem - Local AI with a Great UI

<p align="center">
  <img src="./images/ellem.png" alt="Ellem Logo" width="200"/>
</p>

**Ellem** is a beautiful, modern web interface for interacting with local AI models through Ollama and LM Studio. It features a ChatGPT-style interface with dark/light themes, prompt management, and conversation history—all stored locally in your browser.

## ✨ Features

### 🤖 Multi-Server Support
- **Ollama Integration**: Full support for Ollama's API with model management
- **LM Studio Integration**: Connect to LM Studio's OpenAI-compatible API
- **Extensible Architecture**: Easy to add new AI server types via dependency injection

### 💬 Advanced Chat Interface
- ChatGPT-style conversational UI with markdown support
- Real-time streaming responses
- Conversation history with persistent storage
- Message timestamps and formatting
- Code syntax highlighting

### 📊 Real-Time Statistics
- Connection time tracking
- Response time monitoring
- Tokens per second calculation
- Live performance metrics

### 🎨 Beautiful UI
- Dark blue theme with subtle glows and shadows
- Light mode toggle for different preferences
- Responsive design for all screen sizes
- Smooth animations and transitions
- Bootstrap 5 + custom styling

### 📝 Prompt Manager
- Store and organize prompts with tags
- Support for regular prompts and Stable Diffusion prompts
- Negative prompt support for image generation
- Markdown formatting support
- Tag-based organization (ollama, lmstudio, qwen, stable-diffusion, etc.)

### 💾 Local Storage
- All data stored in IndexedDB (browser-based)
- No server required, 100% client-side
- Export/import functionality as JSON
- Privacy-focused—your data never leaves your machine

### 🔧 Model Management
- List available models from server
- Download new models (Ollama)
- Switch between models on the fly
- Model configuration options

## 🚀 Quick Start

### Prerequisites

You need one of the following AI servers running locally:

#### Option 1: Ollama
```bash
# Install Ollama from https://ollama.ai
# Start Ollama (it runs on http://localhost:11434 by default)
ollama serve

# Download a model
ollama pull llama2
```

#### Option 2: LM Studio
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Download a model through the LM Studio interface
3. Start the local server (typically runs on http://localhost:1234)

### Running Ellem

Ellem is a static web application that runs entirely in your browser:

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/ellem.git
   cd ellem
   ```

2. **Serve the files using any web server**
   
   Option A - Python:
   ```bash
   python -m http.server 8000
   ```
   
   Option B - Node.js:
   ```bash
   npx http-server -p 8000
   ```
   
   Option C - PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in your browser**
   ```
   http://localhost:8000
   ```

4. **Connect to your AI server**
   - Click "Server Profile" button
   - Add a new server profile
   - Select server type (Ollama or LM Studio)
   - Enter the server URL
   - Click Connect

## 📖 Usage Guide

### Creating a Server Profile

1. Click the **Server Profile** button in the navbar
2. Choose **Add New Server**
3. Fill in the details:
   - **Server Type**: Ollama or LM Studio
   - **Name**: A friendly name for your server
   - **URL**: Server address (e.g., http://localhost:11434)
   - **Authentication**: Choose authentication type
     - **None (Disabled)**: For local servers without auth
     - **Bearer Token**: For token-based authentication
     - **API Key**: For API key authentication
     - **Basic Auth**: For username/password authentication
   - **Icon**: An emoji or icon to represent the server
   - **Description**: Optional description
   - **Verify SSL**: Check to verify SSL certificates (uncheck for self-signed certs)
4. Click **Save Profile**

### Connecting to a Server

1. Click **Server Profile**
2. Select a server from the list
3. Click **Connect**
4. Once connected, select a model from the dropdown

### Chatting with AI

1. Type your message in the input box at the bottom
2. Press **Enter** or click the **Send** button
3. Watch as the AI responds in real-time
4. Your conversation is automatically saved

### Managing Prompts

1. Open the **Prompt Manager** in the sidebar
2. Click **New Prompt** to create a prompt
3. Enter:
   - **Title**: Name for your prompt
   - **Prompt Text**: The actual prompt (supports Markdown)
   - **Negative Prompt**: For Stable Diffusion (optional)
   - **Tags**: Categorize with tags like "ollama", "coding", "creative"
4. Click on any saved prompt to load it into the chat input

### Downloading Models (Ollama Only)

1. Connect to an Ollama server
2. Click **Download Model**
3. Enter the model name (e.g., "llama2", "mistral", "codellama")
4. Watch the download progress
5. The new model will appear in the model selector

### Authentication & Security

Ellem supports multiple authentication methods for secure connections:

#### Authentication Types

**None (Disabled)**
- Default for local servers
- No credentials required
- Use for `localhost` connections

**Bearer Token**
- Token-based authentication
- Common for cloud-hosted AI services
- Token sent in `Authorization: Bearer <token>` header

**API Key**
- Key-based authentication
- Custom header name support (default: `X-API-Key`)
- Useful for services requiring API keys

**Basic Authentication**
- Username and password
- Standard HTTP Basic Auth
- Credentials encoded in `Authorization` header

#### SSL Certificate Verification

- **Enabled (default)**: Verifies SSL certificates for HTTPS connections
- **Disabled**: For development with self-signed certificates
- ⚠️ Only disable for trusted local servers

#### Security Best Practices

1. **Use HTTPS** for remote servers
2. **Enable authentication** for any non-localhost connection
3. **Keep credentials secure** - stored locally in your browser
4. **Use strong tokens/passwords** for production servers
5. **Verify SSL certificates** in production environments

### Exporting Your Data

1. Click the **Export** button in the navbar
2. A JSON file will be downloaded containing:
   - All server profiles
   - Chat history
   - Saved prompts
3. You can import this file later or share it (be mindful of privacy)

## 🏗️ Architecture

### Dependency Injection Pattern

Ellem uses a clean dependency injection architecture for AI server engines:

```
EngineManager (manages all engines)
    ↓
BaseEngine (abstract base class)
    ↓
├── OllamaEngine (Ollama implementation)
└── LMStudioEngine (LM Studio implementation)
```

### Adding New Server Types

To add support for a new AI server:

1. Create a new engine class extending `BaseEngine`:
   ```javascript
   class MyNewEngine extends BaseEngine {
       async connect() { /* implementation */ }
       async sendMessage() { /* implementation */ }
       // ... implement other required methods
   }
   ```

2. Register the engine:
   ```javascript
   engineManager.registerEngine('mynew', MyNewEngine);
   ```

That's it! The new server type will automatically appear in the server profile selector.

## 🗂️ Project Structure

```
ellem/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # Custom styles with theming
├── js/
│   ├── app.js                # Main application logic
│   ├── ui.js                 # UI management
│   ├── db.js                 # IndexedDB wrapper
│   ├── engine-manager.js     # Engine dependency injection
│   └── engines/
│       ├── base-engine.js    # Abstract base engine
│       ├── ollama-engine.js  # Ollama implementation
│       └── lmstudio-engine.js # LM Studio implementation
└── README.md                 # This file
```

## 🎨 Theming

Ellem comes with two beautiful themes:

- **Dark Mode** (default): Deep blue tones with subtle glows
- **Light Mode**: Clean white interface

Toggle between themes using the sun/moon icon in the navbar. Your preference is saved locally.

## 🔒 Privacy & Security

- **100% Local**: All data is stored in your browser's IndexedDB
- **No Server**: No backend server, no data transmission
- **No Tracking**: No analytics, no cookies, no tracking
- **Open Source**: Full transparency—review the code yourself

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🐛 Troubleshooting

### Can't connect to Ollama
- Ensure Ollama is running: `ollama serve`
- Check the URL is correct: `http://localhost:11434`
- Verify CORS is enabled (Ollama enables it by default)

### Can't connect to LM Studio
- Ensure the local server is started in LM Studio
- Check the port (default is 1234)
- Verify a model is loaded in LM Studio

### Chat not saving
- Check browser console for errors
- Ensure IndexedDB is enabled in your browser
- Try clearing browser cache and refreshing

## 🌟 Acknowledgments

- Built with [Bootstrap 5](https://getbootstrap.com/)
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/)
- Markdown rendering by [Marked.js](https://marked.js.org/)
- AI backends: [Ollama](https://ollama.ai/) & [LM Studio](https://lmstudio.ai/)

---

**Ellem** - Because local AI deserves a great UI! 🚀
