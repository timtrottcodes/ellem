# Changelog

All notable changes to Ellem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-04

### Added - Initial Release

#### Core Features
- Multi-server AI support with dependency injection architecture
- Ollama integration with full API support
- LM Studio integration with OpenAI-compatible API
- ChatGPT-style conversational interface
- Real-time streaming responses
- Markdown rendering with syntax highlighting
- Dark/Light theme toggle with persistent preferences

#### Security & Authentication
- Multiple authentication methods support:
  - Bearer token authentication
  - API key authentication (with custom header names)
  - Basic authentication (username/password)
  - No authentication (for local servers)
- SSL certificate verification toggle
- Secure credential storage in browser's IndexedDB
- Authentication status indicators in server list
- Support for remote/cloud-hosted AI servers

#### Chat Management
- Auto-saving conversation history
- Chat organization in collapsible sidebar
- Load previous conversations
- Delete old chats
- New chat functionality
- Message timestamps
- Conversation context preservation

#### Prompt Manager
- Create and save reusable prompts
- Tag-based organization system
- Negative prompt support (for Stable Diffusion)
- Markdown support in prompts
- Quick prompt loading into chat
- Delete prompt functionality

#### Model Management
- List available models from connected server
- Switch between models on the fly
- Download new models (Ollama)
- Progress tracking for downloads
- Model selection dropdown

#### Performance Monitoring
- Connection time tracking
- Response time measurement
- Tokens per second calculation
- Live statistics display
- Real-time metrics updates

#### Data Management
- IndexedDB local storage
- Export data as JSON
- Server profile management (create, edit, delete)
- Edit existing server profiles with full credential management
- Delete server profiles with safety confirmation
- Persistent storage across sessions
- Privacy-focused (no cloud sync)

#### UI/UX Features
- Beautiful dark blue theme
- Clean light mode alternative
- Responsive design (desktop, tablet, mobile)
- Smooth animations and transitions
- Subtle drop shadows and glows
- Bootstrap Icons integration
- Toast notifications
- Modal dialogs
- Accordion sidebars

#### Developer Features
- Extensible engine architecture
- Easy to add new AI server types
- Clean separation of concerns
- JSDoc documentation
- Modular code structure
- No build process required
- Pure HTML/CSS/JavaScript

### Technical Details

#### Dependencies
- Bootstrap 5.3.0 (CSS framework)
- jQuery 3.7.0 (DOM manipulation)
- Bootstrap Icons 1.11.0 (iconography)
- Marked.js 9.1.0 (Markdown rendering)

#### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

#### Database Schema
- Version 1
- Three object stores: serverProfiles, chatHistory, prompts
- IndexedDB implementation

## [Unreleased]

### Planned Features

#### Short Term
- [ ] Model settings configuration (temperature, max tokens)
- [ ] Keyboard shortcuts documentation
- [ ] Search functionality for chats
- [ ] Import data from JSON
- [ ] Chat export as Markdown
- [ ] Prompt categories/folders

#### Medium Term
- [ ] Voice input support (Web Speech API)
- [ ] Image upload support (for multimodal models)
- [ ] Conversation branching
- [ ] Multiple conversation threads
- [ ] Prompt sharing (URL encoding)
- [ ] Custom themes/color schemes

#### Long Term
- [ ] Plugin system architecture
- [ ] Additional AI server integrations
- [ ] Real-time collaboration
- [ ] Advanced search with filters
- [ ] Conversation analytics
- [ ] Backup/sync options

### Known Issues
- None currently reported

### Future Considerations
- Progressive Web App (PWA) support
- Offline mode indicator
- Advanced model configuration UI
- Conversation templates
- Prompt marketplace/sharing
- Multi-language UI support
- Accessibility improvements (WCAG AAA)
- Performance optimizations for large datasets

---

## Version History Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

For detailed technical changes, see the [commit history](https://github.com/yourusername/ellem/commits/main).
