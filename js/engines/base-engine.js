/**
 * Base Engine Class
 * Abstract base class for all AI server engines
 * Implements the interface that all engines must follow
 */

class BaseEngine {
    constructor(config) {
        if (new.target === BaseEngine) {
            throw new TypeError("Cannot instantiate abstract class BaseEngine");
        }

        this.config = config || {};
        this.url = config.url || '';
        this.name = config.name || '';
        this.auth = config.auth || null;
        this.connected = false;
        this.currentModel = null;
        this.stats = {
            connectionTime: null,
            lastResponseTime: null,
            tokensPerSecond: null
        };
    }

    /**
     * Test connection to the server
     * Must be implemented by subclasses
     */
    async testConnection() {
        throw new Error("Method 'testConnection()' must be implemented");
    }

    /**
     * Connect to the server
     * Must be implemented by subclasses
     */
    async connect() {
        throw new Error("Method 'connect()' must be implemented");
    }

    /**
     * Disconnect from the server
     */
    async disconnect() {
        this.connected = false;
        this.currentModel = null;
        this.stats = {
            connectionTime: null,
            lastResponseTime: null,
            tokensPerSecond: null
        };
    }

    /**
     * Get list of available models
     * Must be implemented by subclasses
     */
    async getModels() {
        throw new Error("Method 'getModels()' must be implemented");
    }

    /**
     * Download a new model
     * Must be implemented by subclasses
     */
    async downloadModel(modelName) {
        throw new Error("Method 'downloadModel()' must be implemented");
    }

    /**
     * Send a chat message
     * Must be implemented by subclasses
     */
    async sendMessage(message, options = {}) {
        throw new Error("Method 'sendMessage()' must be implemented");
    }

    /**
     * Stream a chat message (for real-time responses)
     * Must be implemented by subclasses
     */
    async streamMessage(message, onChunk, options = {}) {
        throw new Error("Method 'streamMessage()' must be implemented");
    }

    /**
     * Set the current model
     */
    setModel(modelName) {
        this.currentModel = modelName;
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            connectionTime: this.formatTime(this.stats.connectionTime),
            lastResponseTime: this.formatTime(this.stats.lastResponseTime),
            tokensPerSecond: this.stats.tokensPerSecond ? 
                this.stats.tokensPerSecond.toFixed(2) : '0'
        };
    }

    /**
     * Format time in milliseconds to readable format
     */
    formatTime(ms) {
        if (!ms) return '-';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }

    /**
     * Calculate tokens per second
     */
    calculateTokensPerSecond(tokenCount, timeMs) {
        if (!timeMs || timeMs === 0) return 0;
        return (tokenCount / timeMs) * 1000;
    }

    /**
     * Get authentication headers based on auth config
     */
    getAuthHeaders() {
        if (!this.auth || this.auth.type === 'none') {
            return {};
        }

        const headers = {};

        switch (this.auth.type) {
            case 'bearer':
                if (this.auth.token) {
                    headers['Authorization'] = `Bearer ${this.auth.token}`;
                }
                break;

            case 'apikey':
                if (this.auth.apiKey) {
                    const headerName = this.auth.headerName || 'X-API-Key';
                    headers[headerName] = this.auth.apiKey;
                }
                break;

            case 'basic':
                if (this.auth.username && this.auth.password) {
                    const credentials = btoa(`${this.auth.username}:${this.auth.password}`);
                    headers['Authorization'] = `Basic ${credentials}`;
                }
                break;
        }

        return headers;
    }

    /**
     * Make HTTP request with error handling and authentication
     */
    async makeRequest(endpoint, options = {}) {
        const url = this.url.endsWith('/') ?
            `${this.url}${endpoint}` :
            `${this.url}/${endpoint}`;

        try {
            const authHeaders = this.getAuthHeaders();

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please check your credentials.');
                } else if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to access this resource.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            console.error(`Request to ${url} failed:`, error);
            throw error;
        }
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        if (!this.url) {
            throw new Error('Server URL is required');
        }
        if (!this.name) {
            throw new Error('Server name is required');
        }
    }
}
