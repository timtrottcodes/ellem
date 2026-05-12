/**
 * Status Bar Manager
 * Handles the bottom status bar with connection and performance metrics
 */

class StatusBar {
    constructor() {
        this.metrics = {
            serverType: '-',
            connectionStatus: 'Disconnected',
            connected: false,
            requestTime: '-',
            tokensPerSecond: '- t/s',
            totalTokens: '-',
            vramUsage: '-',
            modelLoaded: 'No model',
            contextSize: '-'
        };
        this.requestStartTime = null;
        this.totalTokensCount = 0;
    }

    /**
     * Update connection status
     */
    updateConnection(connected, serverType = null, model = null) {
        this.metrics.connected = connected;
        this.metrics.connectionStatus = connected ? 'Connected' : 'Disconnected';
        
        if (serverType) {
            this.metrics.serverType = serverType;
        }
        
        if (model) {
            this.metrics.modelLoaded = model;
        } else if (!connected) {
            this.metrics.modelLoaded = 'No model';
        }

        this.render();
    }

    /**
     * Start request timer
     */
    startRequest() {
        this.requestStartTime = Date.now();
        this.metrics.requestTime = 'Processing...';
        this.render();
    }

    /**
     * End request timer and calculate tokens/second
     */
    endRequest(tokenCount = 0) {
        if (this.requestStartTime) {
            const duration = Date.now() - this.requestStartTime;
            this.metrics.requestTime = this.formatTime(duration);
            
            // Calculate tokens per second
            if (tokenCount > 0 && duration > 0) {
                const tokensPerSec = (tokenCount / (duration / 1000)).toFixed(2);
                this.metrics.tokensPerSecond = `${tokensPerSec} t/s`;
                this.totalTokensCount += tokenCount;
                this.metrics.totalTokens = this.formatNumber(this.totalTokensCount);
            }
            
            this.requestStartTime = null;
        }
        this.render();
    }

    /**
     * Update performance metrics
     */
    updateMetrics(stats) {
        if (stats.lastResponseTime) {
            this.metrics.requestTime = stats.lastResponseTime;
        }
        
        if (stats.tokensPerSecond) {
            this.metrics.tokensPerSecond = `${stats.tokensPerSecond} t/s`;
        }
        
        if (stats.totalTokens !== undefined) {
            this.totalTokensCount = stats.totalTokens;
            this.metrics.totalTokens = this.formatNumber(stats.totalTokens);
        }
        
        if (stats.vram) {
            this.metrics.vramUsage = stats.vram;
            $('#footerVramItem, #footerVramDivider').show();
        }
        
        if (stats.contextSize) {
            this.metrics.contextSize = this.formatNumber(stats.contextSize);
        }
        
        this.render();
    }

    /**
     * Update model information
     */
    updateModel(modelName, contextSize = null) {
        this.metrics.modelLoaded = modelName || 'No model';
        if (contextSize) {
            this.metrics.contextSize = this.formatNumber(contextSize);
        }
        this.render();
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = {
            serverType: '-',
            connectionStatus: 'Disconnected',
            connected: false,
            requestTime: '-',
            tokensPerSecond: '- t/s',
            totalTokens: '-',
            vramUsage: '-',
            modelLoaded: 'No model',
            contextSize: '-'
        };
        this.requestStartTime = null;
        this.totalTokensCount = 0;
        $('#footerVramItem, #footerVramDivider').hide();
        this.render();
    }

    /**
     * Format time duration
     */
    formatTime(ms) {
        if (!ms || ms === 0) return '-';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }

    /**
     * Format large numbers with K/M suffix
     */
    formatNumber(num) {
        if (!num || num === 0) return '-';
        if (num < 1000) return num.toString();
        if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
        return `${(num / 1000000).toFixed(2)}M`;
    }

    /**
     * Render status bar
     */
    render() {
        // Server type and connection
        $('#footerServerType').text(this.metrics.serverType);
        $('#footerConnectionStatus').text(this.metrics.connectionStatus);

        const $dot = $('#footerConnectionDot');
        $dot.removeClass('connected disconnected connecting');
        $dot.addClass(this.metrics.connected ? 'connected' : 'disconnected');

        // Performance metrics
        $('#footerRequestTime').text(this.metrics.requestTime);
        $('#footerTokensPerSecond').text(this.metrics.tokensPerSecond);
        $('#footerTotalTokens').text(this.metrics.totalTokens);

        // Model info
        $('#footerModelLoaded').text(this.metrics.modelLoaded);
        $('#footerContextSize').text(this.metrics.contextSize);
        $('#footerVramUsage').text(this.metrics.vramUsage);
    }
}

// Create global instance
const statusBar = new StatusBar();

// Initialize on DOM ready
$(document).ready(function() {
    statusBar.render();
});
