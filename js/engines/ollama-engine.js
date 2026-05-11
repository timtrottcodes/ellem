/**
 * Ollama Engine
 * Implementation for Ollama AI server
 * API Documentation: https://github.com/ollama/ollama/blob/main/docs/api.md
 */

class OllamaEngine extends BaseEngine {
    constructor(config) {
        super(config);
        this.type = 'ollama';
    }

    /**
     * Test connection to Ollama server
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('api/tags', {
                method: 'GET'
            });
            return response.ok;
        } catch (error) {
            console.error('Ollama connection test failed:', error);
            return false;
        }
    }

    /**
     * Connect to Ollama server
     */
    async connect() {
        this.validateConfig();
        const startTime = Date.now();
        
        const isConnected = await this.testConnection();
        
        if (isConnected) {
            this.connected = true;
            this.stats.connectionTime = Date.now() - startTime;
            return true;
        }
        
        throw new Error('Failed to connect to Ollama server');
    }

    /**
     * Get list of available models
     */
    async getModels() {
        try {
            const response = await this.makeRequest('api/tags', {
                method: 'GET'
            });
            
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to get models:', error);
            return [];
        }
    }

    /**
     * Download a new model
     */
    async downloadModel(modelName, onProgress = null) {
        try {
            const authHeaders = this.getAuthHeaders();

            const response = await fetch(`${this.url}/api/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
                body: JSON.stringify({
                    name: modelName
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to download model: ${response.statusText}`);
            }

            // Stream the response to get progress updates
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (onProgress) {
                            onProgress(data);
                        }
                    } catch (e) {
                        console.warn('Failed to parse progress data:', e);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Model download failed:', error);
            throw error;
        }
    }

    /**
     * Send a chat message (non-streaming)
     */
    async sendMessage(message, options = {}) {
        const startTime = Date.now();

        try {
            const response = await this.makeRequest('api/generate', {
                method: 'POST',
                body: JSON.stringify({
                    model: this.currentModel,
                    prompt: message,
                    stream: false,
                    ...options
                })
            });

            const data = await response.json();
            
            // Update stats
            const responseTime = Date.now() - startTime;
            this.stats.lastResponseTime = responseTime;
            
            if (data.eval_count && responseTime) {
                this.stats.tokensPerSecond = this.calculateTokensPerSecond(
                    data.eval_count, 
                    responseTime
                );
            }

            return {
                response: data.response,
                model: data.model,
                done: data.done,
                context: data.context,
                stats: {
                    eval_count: data.eval_count,
                    eval_duration: data.eval_duration
                }
            };
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Stream a chat message (real-time responses)
     */
    async streamMessage(message, onChunk, options = {}) {
        const startTime = Date.now();
        let tokenCount = 0;

        try {
            const authHeaders = this.getAuthHeaders();

            const response = await fetch(`${this.url}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
                body: JSON.stringify({
                    model: this.currentModel,
                    prompt: message,
                    stream: true,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        
                        if (data.response) {
                            onChunk(data.response);
                        }

                        if (data.done) {
                            const responseTime = Date.now() - startTime;
                            this.stats.lastResponseTime = responseTime;
                            
                            if (data.eval_count) {
                                this.stats.tokensPerSecond = this.calculateTokensPerSecond(
                                    data.eval_count,
                                    responseTime
                                );
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to parse streaming data:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Streaming failed:', error);
            throw error;
        }
    }
}
