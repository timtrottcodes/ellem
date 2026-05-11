/**
 * Engine Manager
 * Manages AI server engines using dependency injection pattern
 * Allows easy extension with new server types
 */

class EngineManager {
    constructor() {
        // Registry of available engine types
        this.engineRegistry = new Map();
        this.currentEngine = null;
        this.currentProfile = null;
        
        // Register built-in engines
        this.registerEngine('ollama', OllamaEngine);
        this.registerEngine('lmstudio', LMStudioEngine);
    }

    /**
     * Register a new engine type
     * @param {string} type - Engine type identifier
     * @param {class} EngineClass - Engine class (must extend BaseEngine)
     */
    registerEngine(type, EngineClass) {
        if (!(EngineClass.prototype instanceof BaseEngine)) {
            throw new Error('Engine class must extend BaseEngine');
        }
        this.engineRegistry.set(type, EngineClass);
    }

    /**
     * Create and initialize an engine instance
     * @param {object} profile - Server profile configuration
     */
    async createEngine(profile) {
        const EngineClass = this.engineRegistry.get(profile.type);

        if (!EngineClass) {
            throw new Error(`Unknown engine type: ${profile.type}`);
        }

        // Create new engine instance with auth config
        const engine = new EngineClass({
            url: profile.url,
            name: profile.name,
            auth: profile.auth,
            ...profile.config
        });

        return engine;
    }

    /**
     * Connect to a server using a profile
     * @param {object} profile - Server profile
     */
    async connect(profile) {
        try {
            // Disconnect current engine if any
            if (this.currentEngine) {
                await this.disconnect();
            }

            // Create and connect new engine
            this.currentEngine = await this.createEngine(profile);
            await this.currentEngine.connect();
            this.currentProfile = profile;

            return {
                success: true,
                engine: this.currentEngine,
                stats: this.currentEngine.getStats()
            };
        } catch (error) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }

    /**
     * Disconnect from current server
     */
    async disconnect() {
        if (this.currentEngine) {
            await this.currentEngine.disconnect();
            this.currentEngine = null;
            this.currentProfile = null;
        }
    }

    /**
     * Check if currently connected
     */
    isConnected() {
        return this.currentEngine !== null && this.currentEngine.connected;
    }

    /**
     * Get current engine
     */
    getEngine() {
        if (!this.isConnected()) {
            throw new Error('Not connected to any server');
        }
        return this.currentEngine;
    }

    /**
     * Get available models from current engine
     */
    async getModels() {
        return await this.getEngine().getModels();
    }

    /**
     * Set current model
     */
    setModel(modelName) {
        this.getEngine().setModel(modelName);
    }

    /**
     * Send a message
     */
    async sendMessage(message, options = {}) {
        return await this.getEngine().sendMessage(message, options);
    }

    /**
     * Stream a message
     */
    async streamMessage(message, onChunk, options = {}) {
        return await this.getEngine().streamMessage(message, onChunk, options);
    }

    /**
     * Download a model
     */
    async downloadModel(modelName, onProgress = null) {
        return await this.getEngine().downloadModel(modelName, onProgress);
    }

    /**
     * Get current stats
     */
    getStats() {
        if (!this.isConnected()) {
            return {
                connectionTime: '-',
                lastResponseTime: '-',
                tokensPerSecond: '0'
            };
        }
        return this.currentEngine.getStats();
    }

    /**
     * Get list of registered engine types
     */
    getRegisteredEngines() {
        return Array.from(this.engineRegistry.keys());
    }

    /**
     * Get current profile
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Get current model
     */
    getCurrentModel() {
        if (!this.isConnected()) {
            return null;
        }
        return this.currentEngine.currentModel;
    }
}

// Create global instance
const engineManager = new EngineManager();
