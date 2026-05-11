/**
 * UI Manager
 * Handles all UI interactions and updates
 */

const UI = {
    /**
     * Show server profile modal
     */
    showServerProfileModal(profile = null) {
        const isEdit = profile !== null;
        const modalHtml = `
            <div class="modal fade" id="serverProfileModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEdit ? 'Edit' : 'New'} Server Profile</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="serverProfileForm">
                                <input type="hidden" id="profileId" value="${profile?.id || ''}">

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Server Type</label>
                                        <select class="form-select" id="serverType" required>
                                            <option value="">Select Type...</option>
                                            <option value="ollama" ${profile?.type === 'ollama' ? 'selected' : ''}>Ollama</option>
                                            <option value="lmstudio" ${profile?.type === 'lmstudio' ? 'selected' : ''}>LM Studio</option>
                                        </select>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Name</label>
                                        <input type="text" class="form-control" id="serverName"
                                               value="${profile?.name || ''}" placeholder="My Local AI Server" required>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">URL</label>
                                    <input type="url" class="form-control" id="serverUrl"
                                           value="${profile?.url || 'http://localhost:11434'}"
                                           placeholder="http://localhost:11434" required>
                                    <small class="text-muted">
                                        Default: Ollama - http://localhost:11434, LM Studio - http://localhost:1234
                                    </small>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Authentication</label>
                                        <select class="form-select" id="authType">
                                            <option value="none" ${!profile?.auth || profile?.auth?.type === 'none' ? 'selected' : ''}>None (Disabled)</option>
                                            <option value="bearer" ${profile?.auth?.type === 'bearer' ? 'selected' : ''}>Bearer Token</option>
                                            <option value="apikey" ${profile?.auth?.type === 'apikey' ? 'selected' : ''}>API Key</option>
                                            <option value="basic" ${profile?.auth?.type === 'basic' ? 'selected' : ''}>Basic Auth</option>
                                        </select>
                                        <small class="text-muted">Required for remote servers or secured instances</small>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Icon (Emoji)</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="serverIcon"
                                                   value="${profile?.icon || '🤖'}" placeholder="🤖">
                                            <div class="server-icon-preview" id="iconPreview">
                                                ${profile?.icon || '🤖'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Authentication Details (Hidden by default) -->
                                <div id="authDetails" style="display: ${profile?.auth?.type && profile.auth.type !== 'none' ? 'block' : 'none'};">
                                    <div class="card bg-light mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">Authentication Details</h6>

                                            <!-- Bearer Token -->
                                            <div id="bearerTokenFields" style="display: none;">
                                                <div class="mb-3">
                                                    <label class="form-label">Bearer Token</label>
                                                    <input type="password" class="form-control" id="bearerToken"
                                                           value="${profile?.auth?.token || ''}"
                                                           placeholder="your-bearer-token-here">
                                                    <small class="text-muted">Token will be sent in Authorization header</small>
                                                </div>
                                            </div>

                                            <!-- API Key -->
                                            <div id="apiKeyFields" style="display: none;">
                                                <div class="mb-3">
                                                    <label class="form-label">API Key</label>
                                                    <input type="password" class="form-control" id="apiKey"
                                                           value="${profile?.auth?.apiKey || ''}"
                                                           placeholder="your-api-key-here">
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label">API Key Header Name</label>
                                                    <input type="text" class="form-control" id="apiKeyHeader"
                                                           value="${profile?.auth?.headerName || 'X-API-Key'}"
                                                           placeholder="X-API-Key">
                                                    <small class="text-muted">Header name for API key (default: X-API-Key)</small>
                                                </div>
                                            </div>

                                            <!-- Basic Auth -->
                                            <div id="basicAuthFields" style="display: none;">
                                                <div class="row">
                                                    <div class="col-md-6 mb-3">
                                                        <label class="form-label">Username</label>
                                                        <input type="text" class="form-control" id="basicUsername"
                                                               value="${profile?.auth?.username || ''}"
                                                               placeholder="username">
                                                    </div>
                                                    <div class="col-md-6 mb-3">
                                                        <label class="form-label">Password</label>
                                                        <input type="password" class="form-control" id="basicPassword"
                                                               value="${profile?.auth?.password || ''}"
                                                               placeholder="password">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Description (Optional)</label>
                                    <textarea class="form-control" id="serverDescription" rows="2"
                                              placeholder="e.g., Production server with Llama 2">${profile?.description || ''}</textarea>
                                </div>

                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="verifySSL"
                                           ${!profile?.config || profile?.config?.verifySSL !== false ? 'checked' : ''}>
                                    <label class="form-check-label" for="verifySSL">
                                        Verify SSL Certificate
                                    </label>
                                    <small class="text-muted d-block">Uncheck for self-signed certificates (development only)</small>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveProfileBtn">Save Profile</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#modalsContainer').html(modalHtml);
        const modal = new bootstrap.Modal('#serverProfileModal');
        modal.show();

        // Icon preview update
        $('#serverIcon').on('input', function() {
            $('#iconPreview').text($(this).val());
        });

        // Auth type change handler
        $('#authType').on('change', function() {
            const authType = $(this).val();

            // Hide all auth fields first
            $('#authDetails').hide();
            $('#bearerTokenFields, #apiKeyFields, #basicAuthFields').hide();

            // Show relevant fields
            if (authType !== 'none') {
                $('#authDetails').show();

                switch(authType) {
                    case 'bearer':
                        $('#bearerTokenFields').show();
                        break;
                    case 'apikey':
                        $('#apiKeyFields').show();
                        break;
                    case 'basic':
                        $('#basicAuthFields').show();
                        break;
                }
            }
        });

        // Trigger initial auth type display
        if (profile?.auth?.type) {
            $('#authType').val(profile.auth.type).trigger('change');
        }

        // Server type change - update default URL
        $('#serverType').on('change', function() {
            const type = $(this).val();
            const currentUrl = $('#serverUrl').val();

            // Only update if URL is empty or is a default value
            if (!currentUrl || currentUrl === 'http://localhost:11434' || currentUrl === 'http://localhost:1234') {
                if (type === 'ollama') {
                    $('#serverUrl').val('http://localhost:11434');
                } else if (type === 'lmstudio') {
                    $('#serverUrl').val('http://localhost:1234');
                }
            }
        });

        return modal;
    },

    /**
     * Show prompt editor modal
     */
    showPromptModal(prompt = null) {
        const isEdit = prompt !== null;
        const modalHtml = `
            <div class="modal fade" id="promptModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEdit ? 'Edit' : 'New'} Prompt</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="promptForm">
                                <input type="hidden" id="promptId" value="${prompt?.id || ''}">
                                
                                <div class="mb-3">
                                    <label class="form-label">Title</label>
                                    <input type="text" class="form-control" id="promptTitle" 
                                           value="${prompt?.title || ''}" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Prompt Text (Markdown)</label>
                                    <textarea class="form-control" id="promptText" rows="8" required>${prompt?.text || ''}</textarea>
                                    <small class="text-muted">Supports Markdown formatting</small>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Negative Prompt (Optional - for Stable Diffusion)</label>
                                    <textarea class="form-control" id="negativePrompt" rows="3">${prompt?.negativePrompt || ''}</textarea>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Tags</label>
                                    <div class="tag-container" id="tagContainer">
                                        ${(prompt?.tags || []).map(tag => `
                                            <span class="tag-badge">
                                                ${tag}
                                                <span class="tag-remove" data-tag="${tag}">×</span>
                                            </span>
                                        `).join('')}
                                        <input type="text" class="tag-input" id="tagInput" 
                                               placeholder="Type and press Enter...">
                                    </div>
                                    <small class="text-muted">Suggested: ollama, lmstudio, qwen, stable-diffusion</small>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="savePromptBtn">Save Prompt</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#modalsContainer').html(modalHtml);
        const modal = new bootstrap.Modal('#promptModal');
        modal.show();

        // Tag input handling
        this.initializeTagInput();

        return modal;
    },

    /**
     * Initialize tag input functionality
     */
    initializeTagInput() {
        const tagContainer = $('#tagContainer');
        const tagInput = $('#tagInput');

        // Add tag on Enter
        tagInput.on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                const tag = $(this).val().trim();
                if (tag) {
                    UI.addTag(tag);
                    $(this).val('');
                }
            }
        });

        // Remove tag on click
        tagContainer.on('click', '.tag-remove', function() {
            $(this).parent().remove();
        });
    },

    /**
     * Add a tag to the tag container
     */
    addTag(tag) {
        const tagHtml = `
            <span class="tag-badge">
                ${tag}
                <span class="tag-remove" data-tag="${tag}">×</span>
            </span>
        `;
        $('#tagInput').before(tagHtml);
    },

    /**
     * Get all tags from tag container
     */
    getTags() {
        const tags = [];
        $('.tag-badge').each(function() {
            tags.push($(this).text().replace('×', '').trim());
        });
        return tags;
    },

    /**
     * Show model download modal
     */
    showDownloadModelModal() {
        const modalHtml = `
            <div class="modal fade" id="downloadModelModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Download Model</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Model Name</label>
                                <input type="text" class="form-control" id="modelNameInput"
                                       placeholder="e.g., llama2, mistral, codellama">
                                <small class="text-muted">Enter the model name from Ollama library</small>
                            </div>
                            <div id="downloadProgress" style="display: none;">
                                <div class="progress mb-2">
                                    <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                                </div>
                                <small class="text-muted" id="progressText">Preparing download...</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="startDownloadBtn">Download</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#modalsContainer').html(modalHtml);
        const modal = new bootstrap.Modal('#downloadModelModal');
        modal.show();

        return modal;
    },

    /**
     * Update connection status
     */
    updateConnectionStatus(connected, serverName = '') {
        const statusDot = $('.status-dot');
        const statusText = $('#statusText');
        const statsContainer = $('#statsContainer');
        const modelConfig = $('#modelConfig');

        if (connected) {
            statusDot.removeClass('disconnected connecting').addClass('connected');
            statusText.text(`Connected to ${serverName}`);
            statsContainer.show();
            modelConfig.show();
        } else {
            statusDot.removeClass('connected connecting').addClass('disconnected');
            statusText.text('Not Connected');
            statsContainer.hide();
            modelConfig.hide();
        }
    },

    /**
     * Update statistics display
     */
    updateStats(stats) {
        $('#connectionTime').text(stats.connectionTime);
        $('#responseTime').text(stats.lastResponseTime);
        $('#tokensPerSec').text(stats.tokensPerSecond);
    },

    /**
     * Add message to chat
     */
    addMessage(role, content, timestamp = new Date()) {
        const isUser = role === 'user';
        const avatar = isUser ? '👤' : '🤖';
        const author = isUser ? 'You' : 'AI';

        // Hide welcome screen
        $('#welcomeScreen').hide();

        // Parse markdown
        const parsedContent = marked.parse(content);

        const messageHtml = `
            <div class="message ${role}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${author}</span>
                        <span class="message-time">${this.formatTime(timestamp)}</span>
                    </div>
                    <div class="message-text">${parsedContent}</div>
                </div>
            </div>
        `;

        $('#chatMessages').append(messageHtml);
        this.scrollToBottom();
    },

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const typingHtml = `
            <div class="message ai" id="typingIndicator">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        $('#chatMessages').append(typingHtml);
        this.scrollToBottom();
    },

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        $('#typingIndicator').remove();
    },

    /**
     * Add streaming message (updates in real-time)
     */
    addStreamingMessage(messageId) {
        const messageHtml = `
            <div class="message ai" id="${messageId}">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">AI</span>
                        <span class="message-time">${this.formatTime(new Date())}</span>
                    </div>
                    <div class="message-text"></div>
                </div>
            </div>
        `;
        $('#chatMessages').append(messageHtml);
        return messageId;
    },

    /**
     * Update streaming message content
     */
    updateStreamingMessage(messageId, content) {
        const parsedContent = marked.parse(content);
        $(`#${messageId} .message-text`).html(parsedContent);
        this.scrollToBottom();
    },

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        const chatMessages = $('#chatMessages');
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    },

    /**
     * Format timestamp
     */
    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Clear chat messages
     */
    clearChat() {
        $('#chatMessages').empty();
        $('#welcomeScreen').show();
    },

    /**
     * Enable/disable input
     */
    setInputEnabled(enabled) {
        $('#messageInput').prop('disabled', !enabled);
        $('#sendBtn').prop('disabled', !enabled);
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toastHtml = `
            <div class="toast" role="alert">
                <div class="toast-header">
                    <i class="bi bi-${type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                    <strong class="me-auto">Ellem</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">${message}</div>
            </div>
        `;

        let container = $('.toast-container');
        if (container.length === 0) {
            $('body').append('<div class="toast-container"></div>');
            container = $('.toast-container');
        }

        container.append(toastHtml);
        const toast = new bootstrap.Toast(container.find('.toast').last()[0]);
        toast.show();
    },

    /**
     * Populate model select
     */
    populateModels(models) {
        const select = $('#modelSelect');
        select.empty();
        select.append('<option value="">Select Model...</option>');

        models.forEach(model => {
            const name = model.name || model.id || model;
            select.append(`<option value="${name}">${name}</option>`);
        });
    }
};
