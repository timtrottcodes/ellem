/**
 * LM Studio Engine
 * Implementation for LM Studio local server
 * LM Studio uses OpenAI-compatible API
 */

class LMStudioEngine extends BaseEngine {
    constructor(config) {
        super(config);
        this.type = 'lmstudio';
        this.conversationHistory = [];
    }

    /**
     * Test connection to LM Studio server
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('v1/models', {
                method: 'GET'
            });
            return response.ok;
        } catch (error) {
            console.error('LM Studio connection test failed:', error);
            return false;
        }
    }

    /**
     * Connect to LM Studio server
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
        
        throw new Error('Failed to connect to LM Studio server');
    }

    /**
     * Get list of available models
     */
    async getModels() {
        try {
            const response = await this.makeRequest('v1/models', {
                method: 'GET'
            });
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to get models:', error);
            return [];
        }
    }

    /**
     * Download a new model
     * Note: LM Studio doesn't support direct model downloads via API
     */
    async downloadModel(modelName) {
        throw new Error('LM Studio does not support model downloads via API. Please use the LM Studio application to download models.');
    }

    /**
     * Send a chat message (non-streaming)
     */
    async sendMessage(message, options = {}) {
        const startTime = Date.now();

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        try {
            const response = await this.makeRequest('v1/chat/completions', {
                method: 'POST',
                body: JSON.stringify({
                    model: this.currentModel,
                    messages: this.conversationHistory,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || -1,
                    stream: false,
                    ...options
                })
            });

            const data = await response.json();
            
            // Update stats
            const responseTime = Date.now() - startTime;
            this.stats.lastResponseTime = responseTime;
            
            const assistantMessage = data.choices[0].message.content;
            
            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            // Calculate tokens per second
            if (data.usage && data.usage.completion_tokens) {
                this.stats.tokensPerSecond = this.calculateTokensPerSecond(
                    data.usage.completion_tokens,
                    responseTime
                );
            }

            return {
                response: assistantMessage,
                model: data.model,
                usage: data.usage,
                stats: {
                    prompt_tokens: data.usage?.prompt_tokens || 0,
                    completion_tokens: data.usage?.completion_tokens || 0,
                    total_tokens: data.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove the failed message from history
            this.conversationHistory.pop();
            throw error;
        }
    }

    /**
     * Stream a chat message (real-time responses)
     */
    async streamMessage(message, onChunk, options = {}) {
        const startTime = Date.now();
        let fullResponse = '';

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        try {
            const authHeaders = this.getAuthHeaders();

            const response = await fetch(`${this.url}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
                body: JSON.stringify({
                    model: this.currentModel,
                    messages: this.conversationHistory,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || -1,
                    stream: true,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            
                            if (content) {
                                fullResponse += content;
                                onChunk(content);
                            }
                        } catch (e) {
                            console.warn('Failed to parse streaming data:', e);
                        }
                    }
                }
            }

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: fullResponse
            });

            // Update stats
            const responseTime = Date.now() - startTime;
            this.stats.lastResponseTime = responseTime;
            
            // Estimate tokens (rough estimate: ~4 characters per token)
            const estimatedTokens = Math.floor(fullResponse.length / 4);
            this.stats.tokensPerSecond = this.calculateTokensPerSecond(
                estimatedTokens,
                responseTime
            );

        } catch (error) {
            console.error('Streaming failed:', error);
            // Remove the failed message from history
            this.conversationHistory.pop();
            throw error;
        }
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }
}
