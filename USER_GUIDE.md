# Ellem User Guide

Welcome to Ellem! This guide will help you get the most out of your local AI experience.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Server Profiles](#server-profiles)
3. [Chatting with AI](#chatting-with-ai)
4. [Prompt Management](#prompt-management)
5. [Model Management](#model-management)
6. [Tips & Tricks](#tips--tricks)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Setup

1. **Install an AI Server**
   - Choose either Ollama or LM Studio (or both!)
   - Follow installation instructions from their websites
   - Start the server

2. **Launch Ellem**
   - Open `index.html` in your web browser
   - Or serve it with a local web server

3. **Create Your First Server Profile**
   - Click the **Server Profile** button in the top navbar
   - Click **Add New Server**
   - Fill in the details and save

4. **Connect and Chat**
   - Select your server profile
   - Click **Connect**
   - Choose a model
   - Start chatting!

## Server Profiles

### What is a Server Profile?

A server profile stores the connection information for an AI server. You can have multiple profiles for different servers or configurations.

### Creating a Profile

1. Click **Server Profile** → **Add New Server**
2. Fill in:
   - **Server Type**: Choose Ollama or LM Studio
   - **Name**: A memorable name (e.g., "My Ollama Server")
   - **URL**: Server address
     - Ollama default: `http://localhost:11434`
     - LM Studio default: `http://localhost:1234`
   - **Icon**: Pick an emoji or icon (🤖, 🦙, 🎨)
   - **Description**: Optional notes

### Common URLs

| Server | Default URL |
|--------|-------------|
| Ollama (local) | http://localhost:11434 |
| LM Studio (local) | http://localhost:1234 |
| Remote Ollama | http://your-server-ip:11434 |

### Managing Server Profiles

**Switching Servers:**
1. Click **Server Profile**
2. Select a different server from the list
3. Click **Connect**

**Editing a Profile:**
1. Click **Server Profile**
2. Click the **Edit** button (pencil icon) on any server
3. Modify the settings
4. Click **Save Profile**

**Deleting a Profile:**
1. Click **Server Profile**
2. Click the **Delete** button (trash icon) on any server
3. Confirm deletion
4. Note: If you delete the currently connected server, you'll be disconnected

## Chatting with AI

### Starting a Conversation

1. Ensure you're connected to a server (green dot in status bar)
2. Select a model from the dropdown
3. Type your message in the input box
4. Press **Enter** or click **Send**

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message (without sending)

### Understanding the Interface

**Status Bar** (top):
- 🟢 Green dot = Connected
- 🔴 Red dot = Disconnected
- 🟡 Yellow dot = Connecting

**Statistics** (when connected):
- ⏱️ Connection Time: How long it took to connect
- ⚡ Response Time: How long the last response took
- 🖥️ Tokens/sec: Processing speed

### Message Features

- **Markdown Support**: Use Markdown formatting in your messages
  ```markdown
  **bold**, *italic*, `code`, [links](url)
  ```
- **Code Blocks**: Syntax highlighting for code
  ````markdown
  ```python
  def hello():
      print("Hello, World!")
  ```
  ````
- **Lists**: Ordered and unordered lists
- **Headings**: Use # for headings

### Managing Conversations

**New Chat**: Click the **+ New Chat** button to start fresh

**Loading Previous Chats**:
1. Open the **Chat History** accordion in the sidebar
2. Click on any previous conversation
3. Continue where you left off

**Deleting Chats**:
1. Hover over a chat in the sidebar
2. Click the trash icon that appears
3. Confirm deletion

## Prompt Management

### What are Prompts?

Prompts are reusable templates for common tasks. Save your best prompts and reuse them anytime!

### Creating a Prompt

1. Click **Prompt Manager** in the sidebar
2. Click **+ New Prompt**
3. Fill in:
   - **Title**: Short name for the prompt
   - **Prompt Text**: The actual prompt (supports Markdown)
   - **Negative Prompt**: For Stable Diffusion (optional)
   - **Tags**: Categorize your prompt
4. Click **Save Prompt**

### Using Tags

Tags help organize your prompts. Common tags:

- `ollama` - For Ollama-specific prompts
- `lmstudio` - For LM Studio prompts
- `coding` - Programming-related prompts
- `creative` - Creative writing prompts
- `stable-diffusion` - Image generation prompts
- `qwen` - For Qwen model prompts

### Using a Saved Prompt

1. Open **Prompt Manager** in sidebar
2. Click on any prompt
3. It will load into the message input
4. Edit if needed and send

### Example Prompts

**Code Review**:
```markdown
Please review the following code for:
- Best practices
- Potential bugs
- Performance improvements
- Security issues

[Paste your code here]
```
Tags: `coding`, `review`, `ollama`

**Creative Writing**:
```markdown
Write a short story about [topic] with:
- Engaging characters
- Plot twist
- 500 words max
```
Tags: `creative`, `writing`

**Stable Diffusion**:
```markdown
Prompt: A beautiful landscape with mountains and lakes, sunset, highly detailed, 4k
Negative Prompt: blurry, low quality, distorted, ugly
```
Tags: `stable-diffusion`, `landscape`

## Model Management

### Selecting a Model

1. Connect to a server
2. Choose from the **Model** dropdown
3. The selected model will be used for all future messages

### Downloading Models (Ollama Only)

1. Click **Download Model**
2. Enter the model name:
   - `llama2` - Meta's Llama 2
   - `mistral` - Mistral AI's model
   - `codellama` - Code-specialized Llama
   - `qwen` - Alibaba's Qwen model
   - Many more at [Ollama Library](https://ollama.ai/library)
3. Click **Download**
4. Wait for download to complete
5. Model appears in the dropdown

### Model Settings

Click the **⚙️ Settings** button to configure:
- Temperature
- Max tokens
- Context window
- Other model-specific parameters

*(Note: This feature may need implementation based on your needs)*

## Tips & Tricks

### 1. Theme Switching

Click the ☀️/🌙 icon in the navbar to toggle between dark and light modes. Your preference is saved automatically.

### 2. Fast Prompt Access

Create prompts for common tasks:
- "Explain like I'm 5"
- "Translate to [language]"
- "Summarize this article"
- "Debug this code"

### 3. Conversation Context

AI remembers the conversation context! You can:
- Ask follow-up questions
- Reference previous messages
- Build on earlier topics

### 4. Organizing Chats

Use descriptive first messages so chat titles are meaningful:
- ❌ "Hello"
- ✅ "Help me debug Python script for data analysis"

### 5. Export Your Data

Regularly export your data:
1. Click **Export** in navbar
2. Save the JSON file
3. Keep backups of important conversations and prompts

### 6. Multi-Server Workflow

Set up different servers for different purposes:
- Server 1: Fast model for quick questions
- Server 2: Large model for complex tasks
- Server 3: Code-specialized model for programming

### 7. Markdown Formatting

Use Markdown to structure complex prompts:
```markdown
# Task: Data Analysis

## Requirements:
1. Load CSV file
2. Clean data
3. Generate statistics

## Expected Output:
- Summary statistics
- Visualizations
- Insights
```

## Troubleshooting

### Connection Issues

**Problem**: Can't connect to server

**Solutions**:
- ✅ Verify the server is running
- ✅ Check the URL is correct
- ✅ Ensure no firewall blocking
- ✅ Try `http://localhost:11434` or `http://127.0.0.1:11434`

### Model Not Loading

**Problem**: No models appear in dropdown

**Solutions**:
- ✅ Ensure server is connected (green dot)
- ✅ For Ollama: Run `ollama list` to verify models
- ✅ For LM Studio: Load a model in the app
- ✅ Refresh the page

### Messages Not Saving

**Problem**: Chats disappear after refresh

**Solutions**:
- ✅ Check browser console for errors (F12)
- ✅ Ensure IndexedDB is enabled
- ✅ Try a different browser
- ✅ Clear cache and try again

### Slow Responses

**Problem**: AI takes too long to respond

**Solutions**:
- ✅ Use a smaller/faster model
- ✅ Reduce max tokens setting
- ✅ Check your computer's resources (CPU/RAM/GPU)
- ✅ Close other applications

### Styling Issues

**Problem**: UI looks broken

**Solutions**:
- ✅ Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Clear browser cache
- ✅ Ensure all CSS files loaded correctly
- ✅ Check browser console for errors

### CORS Errors

**Problem**: CORS policy errors in console

**Solutions**:
- ✅ Ollama enables CORS by default
- ✅ LM Studio: Check server settings for CORS
- ✅ Serve Ellem from a web server (not file://)

## Advanced Usage

### Custom Engine Development

Want to add support for another AI server? See [ARCHITECTURE.md](ARCHITECTURE.md) for details on creating custom engines.

### Data Migration

Export from one browser and import to another:
1. Export data (JSON file)
2. On new browser, open developer console
3. Use `ellemDB.importData(jsonData)` *(feature may need implementation)*

### Keyboard Power User

- **Ctrl/Cmd + K**: Quick model switch *(could be added)*
- **Ctrl/Cmd + N**: New chat
- **Ctrl/Cmd + E**: Export data

### Performance Optimization

For large chat histories:
- Archive old conversations
- Export and delete completed projects
- Keep active chats under 50 messages

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check README.md and ARCHITECTURE.md
- **Community**: Join discussions on GitHub

---

Enjoy your local AI experience with Ellem! 🚀
