/**
 * Ellem Main Application
 * Initializes the app and handles user interactions
 */

class EllemApp {
    constructor() {
        this.currentChatId = null;
        this.currentMessages = [];
        this.serverProfiles = [];
        this.chatHistory = [];
        this.prompts = [];
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize database
            await ellemDB.init();
            console.log('Database initialized');

            // Load data
            await this.loadData();

            // Setup event listeners
            this.setupEventListeners();

            // Apply saved theme
            this.loadTheme();

            // Initialize status bar
            statusBar.reset();
            statusBar.render();

            console.log('Ellem initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Ellem:', error);
            UI.showToast('Failed to initialize application', 'error');
        }
    }

    /**
     * Load data from database
     */
    async loadData() {
        this.serverProfiles = await ellemDB.getAll('serverProfiles');
        this.chatHistory = await ellemDB.getAll('chatHistory');
        this.prompts = await ellemDB.getAll('prompts');

        this.renderChatHistory();
        this.renderPrompts();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        $('#themeToggle').on('click', () => this.toggleTheme());

        // Server profile button
        $('#serverProfileBtn').on('click', () => this.showServerProfiles());

        // New chat button
        $('#newChatBtn').on('click', () => this.newChat());

        // Send message
        $('#sendBtn').on('click', () => this.sendMessage());
        $('#messageInput').on('keypress', (e) => {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        $('#messageInput').on('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Model selection
        $('#modelSelect').on('change', (e) => {
            const model = $(e.target).val();
            if (model && engineManager.isConnected()) {
                engineManager.setModel(model);
                UI.showToast(`Model changed to ${model}`);

                // Update status bar with model info
                // Context size varies by model, using common defaults
                const contextSize = 4096; // Default context window
                statusBar.updateModel(model, contextSize);
            }
        });

        // Download model button
        $('#downloadModelBtn').on('click', () => this.downloadModel());

        // New prompt button
        $('#newPromptBtn').on('click', () => this.createPrompt());

        // Export button
        $('#exportBtn').on('click', () => this.exportData());

        // Chat history item click
        $('#chatHistoryList').on('click', '.chat-history-item', (e) => {
            if (!$(e.target).hasClass('delete-btn')) {
                const chatId = $(e.currentTarget).data('id');
                this.loadChat(chatId);
            }
        });

        // Prompt item click
        $('#promptList').on('click', '.prompt-item', (e) => {
            if (!$(e.target).hasClass('delete-btn')) {
                const promptId = $(e.currentTarget).data('id');
                this.usePrompt(promptId);
            }
        });

        // Delete buttons
        $('#chatHistoryList').on('click', '.delete-btn', (e) => {
            e.stopPropagation();
            const chatId = $(e.currentTarget).closest('.chat-history-item').data('id');
            this.deleteChat(chatId);
        });

        $('#promptList').on('click', '.delete-btn', (e) => {
            e.stopPropagation();
            const promptId = $(e.currentTarget).closest('.prompt-item').data('id');
            this.deletePrompt(promptId);
        });
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const body = $('body');
        const icon = $('#themeToggle i');
        
        if (body.hasClass('dark-mode')) {
            body.removeClass('dark-mode').addClass('light-mode');
            icon.removeClass('bi-sun').addClass('bi-moon');
            localStorage.setItem('theme', 'light');
        } else {
            body.removeClass('light-mode').addClass('dark-mode');
            icon.removeClass('bi-moon').addClass('bi-sun');
            localStorage.setItem('theme', 'dark');
        }
    }

    /**
     * Load saved theme
     */
    loadTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        const body = $('body');
        const icon = $('#themeToggle i');
        
        if (theme === 'light') {
            body.removeClass('dark-mode').addClass('light-mode');
            icon.removeClass('bi-sun').addClass('bi-moon');
        }
    }

    /**
     * Show server profiles
     */
    showServerProfiles() {
        if (this.serverProfiles.length === 0) {
            this.createServerProfile();
        } else {
            this.showServerList();
        }
    }

    /**
     * Show server list modal
     */
    showServerList() {
        const modalHtml = `
            <div class="modal fade" id="serverListModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Server Profiles</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="list-group" id="serverList">
                                ${this.serverProfiles.map(profile => `
                                    <div class="list-group-item list-group-item-action" data-id="${profile.id}">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="flex-grow-1">
                                                <span style="font-size: 1.5rem; margin-right: 0.5rem;">${profile.icon}</span>
                                                <strong>${profile.name}</strong>
                                                <small class="text-muted d-block">
                                                    ${profile.url}
                                                    ${profile.auth && profile.auth.type !== 'none' ?
                                                        ` <span class="badge bg-success"><i class="bi bi-shield-check"></i> ${profile.auth.type}</span>` :
                                                        ''}
                                                </small>
                                            </div>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${profile.id}" title="Edit">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger delete-profile-btn" data-id="${profile.id}" title="Delete">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                                <button class="btn btn-sm btn-primary connect-btn" title="Connect">
                                                    <i class="bi bi-plug"></i> Connect
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="btn btn-outline-primary w-100 mt-3" id="addServerBtn">
                                <i class="bi bi-plus"></i> Add New Server
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#modalsContainer').html(modalHtml);
        const modal = new bootstrap.Modal('#serverListModal');
        modal.show();

        // Connect button handler
        $('#serverList').on('click', '.connect-btn', async (e) => {
            e.stopPropagation();
            const profileId = parseInt($(e.target).closest('.list-group-item').data('id'));
            await this.connectToServer(profileId);
            modal.hide();
        });

        // Edit button handler
        $('#serverList').on('click', '.edit-btn', (e) => {
            e.stopPropagation();
            const profileId = parseInt($(e.target).closest('.edit-btn').data('id'));
            modal.hide();
            this.editServerProfile(profileId);
        });

        // Delete button handler
        $('#serverList').on('click', '.delete-profile-btn', async (e) => {
            e.stopPropagation();
            const profileId = parseInt($(e.target).closest('.delete-profile-btn').data('id'));
            const profile = this.serverProfiles.find(p => p.id === profileId);

            if (confirm(`Are you sure you want to delete the server profile "${profile.name}"?`)) {
                try {
                    await ellemDB.delete('serverProfiles', profileId);
                    await this.loadData();
                    UI.showToast('Server profile deleted');

                    // If this was the connected server, disconnect
                    if (engineManager.getCurrentProfile()?.id === profileId) {
                        await engineManager.disconnect();
                        UI.updateConnectionStatus(false);
                        UI.setInputEnabled(false);
                        statusBar.reset();
                    }

                    // Refresh the modal
                    modal.hide();
                    this.showServerList();
                } catch (error) {
                    console.error('Failed to delete profile:', error);
                    UI.showToast('Failed to delete server profile', 'error');
                }
            }
        });

        // Add server button
        $('#addServerBtn').on('click', () => {
            modal.hide();
            this.createServerProfile();
        });
    }

    /**
     * Create new server profile
     */
    createServerProfile() {
        const modal = UI.showServerProfileModal();

        $('#saveProfileBtn').on('click', async () => {
            // Get authentication details
            const authType = $('#authType').val();
            let auth = { type: authType };

            if (authType === 'bearer') {
                auth.token = $('#bearerToken').val();
            } else if (authType === 'apikey') {
                auth.apiKey = $('#apiKey').val();
                auth.headerName = $('#apiKeyHeader').val() || 'X-API-Key';
            } else if (authType === 'basic') {
                auth.username = $('#basicUsername').val();
                auth.password = $('#basicPassword').val();
            }

            const profile = {
                type: $('#serverType').val(),
                name: $('#serverName').val(),
                url: $('#serverUrl').val(),
                icon: $('#serverIcon').val(),
                description: $('#serverDescription').val(),
                auth: authType !== 'none' ? auth : null,
                config: {
                    verifySSL: $('#verifySSL').is(':checked')
                },
                createdAt: new Date().toISOString()
            };

            try {
                await ellemDB.add('serverProfiles', profile);
                await this.loadData();
                UI.showToast('Server profile created successfully');
                modal.hide();
            } catch (error) {
                console.error('Failed to create profile:', error);
                UI.showToast('Failed to create server profile', 'error');
            }
        });
    }

    /**
     * Edit existing server profile
     */
    editServerProfile(profileId) {
        const profile = this.serverProfiles.find(p => p.id === profileId);
        if (!profile) return;

        const modal = UI.showServerProfileModal(profile);

        $('#saveProfileBtn').on('click', async () => {
            // Get authentication details
            const authType = $('#authType').val();
            let auth = { type: authType };

            if (authType === 'bearer') {
                auth.token = $('#bearerToken').val();
            } else if (authType === 'apikey') {
                auth.apiKey = $('#apiKey').val();
                auth.headerName = $('#apiKeyHeader').val() || 'X-API-Key';
            } else if (authType === 'basic') {
                auth.username = $('#basicUsername').val();
                auth.password = $('#basicPassword').val();
            }

            const updatedProfile = {
                id: profileId,
                type: $('#serverType').val(),
                name: $('#serverName').val(),
                url: $('#serverUrl').val(),
                icon: $('#serverIcon').val(),
                description: $('#serverDescription').val(),
                auth: authType !== 'none' ? auth : null,
                config: {
                    verifySSL: $('#verifySSL').is(':checked')
                },
                createdAt: profile.createdAt, // Preserve original creation date
                updatedAt: new Date().toISOString()
            };

            try {
                await ellemDB.update('serverProfiles', updatedProfile);
                await this.loadData();
                UI.showToast('Server profile updated successfully');
                modal.hide();
            } catch (error) {
                console.error('Failed to update profile:', error);
                UI.showToast('Failed to update server profile', 'error');
            }
        });
    }

    /**
     * Connect to server
     */
    async connectToServer(profileId) {
        const profile = this.serverProfiles.find(p => p.id === profileId);
        if (!profile) return;

        try {
            UI.showToast('Connecting to server...');
            UI.updateConnectionStatus(false);
            statusBar.updateConnection(false);

            const result = await engineManager.connect(profile);

            UI.updateConnectionStatus(true, profile.name);
            UI.updateStats(result.stats);
            UI.setInputEnabled(true);

            // Update status bar with connection info
            statusBar.updateConnection(true, profile.type.toUpperCase(), null);

            // Load models
            const models = await engineManager.getModels();
            UI.populateModels(models);

            UI.showToast(`Connected to ${profile.name}`);

            // Auto-select first model if available
            if (models.length > 0) {
                const firstModel = models[0].name || models[0].id || models[0];
                $('#modelSelect').val(firstModel);
                engineManager.setModel(firstModel);

                // Update status bar with model
                statusBar.updateModel(firstModel, 4096);
            }

        } catch (error) {
            console.error('Connection failed:', error);
            UI.showToast('Failed to connect to server', 'error');
            UI.updateConnectionStatus(false);
            statusBar.updateConnection(false);
        }
    }

    /**
     * Send message
     */
    async sendMessage() {
        if (!engineManager.isConnected()) {
            UI.showToast('Please connect to a server first', 'error');
            return;
        }

        const message = $('#messageInput').val().trim();
        if (!message) return;

        // Clear input
        $('#messageInput').val('').css('height', 'auto');

        // Add user message to UI
        UI.addMessage('user', message);

        // Save message to current chat
        this.currentMessages.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Disable input while processing
        UI.setInputEnabled(false);

        // Start performance tracking
        statusBar.startRequest();
        const startTime = Date.now();
        let tokenCount = 0;

        try {
            // Create streaming message
            const messageId = 'msg_' + Date.now();
            UI.addStreamingMessage(messageId);

            let fullResponse = '';

            // Stream response
            await engineManager.streamMessage(message, (chunk) => {
                fullResponse += chunk;
                UI.updateStreamingMessage(messageId, fullResponse);

                // Estimate token count (rough approximation: ~4 chars per token)
                tokenCount = Math.floor(fullResponse.length / 4);
            });

            // Calculate final metrics
            const duration = Date.now() - startTime;
            const finalTokenCount = Math.floor(fullResponse.length / 4);

            // End performance tracking
            statusBar.endRequest(finalTokenCount);

            // Save AI response
            this.currentMessages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString()
            });

            // Update stats
            UI.updateStats(engineManager.getStats());

            // Save chat
            await this.saveCurrentChat();

        } catch (error) {
            console.error('Failed to send message:', error);
            UI.showToast('Failed to send message', 'error');
            statusBar.endRequest(0);
        } finally {
            UI.setInputEnabled(true);
            $('#messageInput').focus();
        }
    }

    /**
     * Save current chat
     */
    async saveCurrentChat() {
        if (this.currentMessages.length === 0) return;

        const title = this.currentMessages[0].content.substring(0, 50) + '...';

        const chatData = {
            title: title,
            messages: this.currentMessages,
            serverProfileId: engineManager.getCurrentProfile()?.id,
            model: engineManager.getCurrentModel(),
            createdAt: this.currentChatId ?
                this.chatHistory.find(c => c.id === this.currentChatId)?.createdAt :
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (this.currentChatId) {
                chatData.id = this.currentChatId;
                await ellemDB.update('chatHistory', chatData);
            } else {
                this.currentChatId = await ellemDB.add('chatHistory', chatData);
            }
            await this.loadData();
        } catch (error) {
            console.error('Failed to save chat:', error);
        }
    }

    /**
     * New chat
     */
    newChat() {
        this.currentChatId = null;
        this.currentMessages = [];
        UI.clearChat();
        $('.chat-history-item').removeClass('active');
    }

    /**
     * Load chat
     */
    async loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;

        this.currentChatId = chatId;
        this.currentMessages = chat.messages || [];

        UI.clearChat();

        // Render messages
        this.currentMessages.forEach(msg => {
            UI.addMessage(msg.role, msg.content, new Date(msg.timestamp));
        });

        // Update active state
        $('.chat-history-item').removeClass('active');
        $(`.chat-history-item[data-id="${chatId}"]`).addClass('active');
    }

    /**
     * Delete chat
     */
    async deleteChat(chatId) {
        if (!confirm('Are you sure you want to delete this chat?')) return;

        try {
            await ellemDB.delete('chatHistory', chatId);
            await this.loadData();

            if (this.currentChatId === chatId) {
                this.newChat();
            }

            UI.showToast('Chat deleted');
        } catch (error) {
            console.error('Failed to delete chat:', error);
            UI.showToast('Failed to delete chat', 'error');
        }
    }

    /**
     * Render chat history
     */
    renderChatHistory() {
        const container = $('#chatHistoryList');
        container.empty();

        if (this.chatHistory.length === 0) {
            container.append('<p class="text-muted text-center">No chats yet</p>');
            return;
        }

        // Sort by most recent
        const sorted = [...this.chatHistory].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        sorted.forEach(chat => {
            const date = new Date(chat.updatedAt).toLocaleDateString();
            const itemHtml = `
                <div class="chat-history-item ${chat.id === this.currentChatId ? 'active' : ''}"
                     data-id="${chat.id}">
                    <span class="chat-title">${chat.title}</span>
                    <span class="chat-date">${date}</span>
                    <button class="btn btn-sm btn-danger delete-btn float-end">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            container.append(itemHtml);
        });
    }

    /**
     * Create prompt
     */
    createPrompt() {
        const modal = UI.showPromptModal();

        $('#savePromptBtn').on('click', async () => {
            const prompt = {
                title: $('#promptTitle').val(),
                text: $('#promptText').val(),
                negativePrompt: $('#negativePrompt').val(),
                tags: UI.getTags(),
                createdAt: new Date().toISOString()
            };

            try {
                await ellemDB.add('prompts', prompt);
                await this.loadData();
                UI.showToast('Prompt saved successfully');
                modal.hide();
            } catch (error) {
                console.error('Failed to save prompt:', error);
                UI.showToast('Failed to save prompt', 'error');
            }
        });
    }

    /**
     * Use prompt
     */
    usePrompt(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt) return;

        $('#messageInput').val(prompt.text);
        UI.showToast(`Prompt "${prompt.title}" loaded`);
    }

    /**
     * Delete prompt
     */
    async deletePrompt(promptId) {
        if (!confirm('Are you sure you want to delete this prompt?')) return;

        try {
            await ellemDB.delete('prompts', promptId);
            await this.loadData();
            UI.showToast('Prompt deleted');
        } catch (error) {
            console.error('Failed to delete prompt:', error);
            UI.showToast('Failed to delete prompt', 'error');
        }
    }

    /**
     * Render prompts
     */
    renderPrompts() {
        const container = $('#promptList');
        container.empty();

        if (this.prompts.length === 0) {
            container.append('<p class="text-muted text-center">No prompts yet</p>');
            return;
        }

        this.prompts.forEach(prompt => {
            const itemHtml = `
                <div class="prompt-item" data-id="${prompt.id}">
                    <div class="prompt-title">${prompt.title}</div>
                    <div class="prompt-tags">
                        ${prompt.tags.map(tag => `<span class="prompt-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="btn btn-sm btn-danger delete-btn float-end">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            container.append(itemHtml);
        });
    }

    /**
     * Download model
     */
    async downloadModel() {
        if (!engineManager.isConnected()) {
            UI.showToast('Please connect to a server first', 'error');
            return;
        }

        const modal = UI.showDownloadModelModal();

        $('#startDownloadBtn').on('click', async () => {
            const modelName = $('#modelNameInput').val().trim();
            if (!modelName) {
                UI.showToast('Please enter a model name', 'error');
                return;
            }

            try {
                $('#downloadProgress').show();
                $('#startDownloadBtn').prop('disabled', true);

                await engineManager.downloadModel(modelName, (progress) => {
                    if (progress.status) {
                        $('#progressText').text(progress.status);
                    }
                    if (progress.completed && progress.total) {
                        const percent = (progress.completed / progress.total) * 100;
                        $('#progressBar').css('width', percent + '%');
                    }
                });

                UI.showToast('Model downloaded successfully');
                modal.hide();

                // Reload models
                const models = await engineManager.getModels();
                UI.populateModels(models);

            } catch (error) {
                console.error('Download failed:', error);
                UI.showToast(error.message || 'Download failed', 'error');
            } finally {
                $('#startDownloadBtn').prop('disabled', false);
            }
        });
    }

    /**
     * Export data
     */
    async exportData() {
        try {
            const data = await ellemDB.exportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `ellem-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
            UI.showToast('Data exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            UI.showToast('Failed to export data', 'error');
        }
    }
}

// Initialize app when DOM is ready
$(document).ready(() => {
    const app = new EllemApp();
    app.init();

    // Make app available globally for debugging
    window.ellemApp = app;
});
