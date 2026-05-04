const ChatManager = {

    currentChat: null,
    adapter: null, // set when server is connected

    // Create a new chat
    async newChat(title = "New Chat") {
        this.currentChat = await ChatDB.createChat();
        this.currentChat.title = title;
        UI.renderChatList();
        UI.renderChatMessages(this.currentChat);
    },

    // Send a user message and get a streaming response
    async sendMessage(text) {

        if (!this.adapter) {
            alert("No server connected.");
            return;
        }

        if (!this.currentChat) {
            await this.newChat();
        }

        // Add user message
        const msgUser = { role: "user", content: text, timestamp: new Date().toISOString() };
        this.currentChat.messages.push(msgUser);
        UI.addMessage(msgUser);

        // Add assistant bubble with typing animation
        const msgAssistant = { role: "assistant", content: "", timestamp: new Date().toISOString() };
        this.currentChat.messages.push(msgAssistant);

        const bubbleId = UI.addMessage(msgAssistant);
        let typingInterval = UI.startTyping(bubbleId);

        let firstTokenReceived = false; // <-- track first token
        let tokenCount = 0;
        const startTime = performance.now();
    
        try {
            await this.adapter.chat(this.currentChat.messages, (chunk) => {

                // Split chunk into JSON objects safely
                const parts = chunk.trim().split(/\}\s*\{/).map((s, i, a) => {
                    if (i !== 0) s = '{' + s;
                    if (i !== a.length - 1) s = s + '}';
                    return s;
                });

                for (const p of parts) {
                    try {
                        const json = JSON.parse(p);

                        if (json.message && json.message.content) {

                            // Stop typing animation on first token
                            if (!firstTokenReceived) {
                                UI.stopTyping(typingInterval, bubbleId, "");
                                firstTokenReceived = true;
                            }

                            // Append streamed token
                            msgAssistant.content += json.message.content;
                            UI.updateMessage(bubbleId, msgAssistant.content);

                            // Update performance
                            tokenCount += json.message.content.split(/\s+/).length;
                            const elapsed = (performance.now()-startTime)/1000; // seconds
                            const tokensPerSec = Math.round(tokenCount/elapsed);
                            UI.updatePerformance({
                                vram: this.adapter.getVRAM?.() ?? '--',
                                tokensPerSec,
                                latency: Math.round(elapsed*1000),
                                model: json.model
                            });
                        }

                        if (json.done) {
                            // Ensure typing animation is stopped
                            if (!firstTokenReceived) {
                                UI.stopTyping(typingInterval, bubbleId, msgAssistant.content);
                            }

                            UI.updatePerformance({
                                vram: this.adapter.getVRAM?.() ?? '--',
                                tokensPerSec,
                                latency: Math.round((performance.now()-startTime)),
                                model: json.model
                            });
                        }

                    } catch (e) {
                        // incomplete JSON, ignore
                    }
                }

            });
        } catch (err) {
            UI.stopTyping(typingInterval, bubbleId, "⚠ Error: " + err.message);
            msgAssistant.content = "⚠ Error: " + err.message;
        }

        await ChatDB.saveChat(this.currentChat);
    },

    // Load an existing chat
    async loadChat(chatId) {
        const chats = await ChatDB.getChats();
        this.currentChat = chats.find(c => c.id === chatId);
        UI.renderChatMessages(this.currentChat);
    }
};