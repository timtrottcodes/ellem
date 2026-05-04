const UI = {

    currentServer: null,
    currentModel: null,

    bindEvents() {

        // Send button
        $("#send-button").click(() => {
            const text = $("#chat-input").val();
            if (!text) return;
            $("#chat-input").val("");
            ChatManager.sendMessage(text);
        });

        // Enter key in textarea
        $("#chat-input").keypress((e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                $("#send-button").click();
            }
        });

        $("#add-server-btn").click(() => {

            $("#server-modal").modal("show")

        })

        $("#save-server-btn").click(async () => {

            const server = {

                id: crypto.randomUUID(),

                name: $("#server-name").val(),

                type: $("#server-type").val(),

                url: $("#server-url").val()

            }

            await ServerDB.addServer(server)

            $("#server-modal").modal("hide")

            UI.loadServers()

        })


        $("#server-select").change(async () => {

            const id = $("#server-select").val()

            const server = await ServerDB.getServer(id)

            await UI.connectServer(server)

        })

        $("#model-select").change(() => {

            UI.currentModel = $("#model-select").val()

        })

    },

    async loadServers() {

        const servers = await ServerDB.getServers()

        const select = $("#server-select")

        select.empty()

        servers.forEach(server => {

            select.append(`
            <option value="${server.id}">
                ${server.name}
            </option>
        `)

        })

    },

    async connectServer(server) {

        UI.currentServer = server
        UI.updateConnectionStatus("connecting", `Connecting to ${server.url}…`)

        try {

            const AdapterClass = ApiRegistry.get(server.type)
            ChatManager.adapter = new AdapterClass(server)

            // Test connection by listing models
            const models = await ChatManager.adapter.listModels()

            UI.currentModel = models[0]

            // Populate model selector
            const select = $("#model-select")
            select.empty()
            models.forEach(m => {
                select.append(`<option value="${m}">${m}</option>`)
            })

            UI.updateConnectionStatus("connected", `Connected to ${server.url} (${server.type})`)

        } catch (e) {

            console.warn("Server connection failed:", e)

            ChatManager.adapter = null
            UI.currentModel = null

            UI.updateConnectionStatus("failed", `Failed to connect to ${server.url}`)

            // Optional: clear models
            $("#model-select").empty()

        }

    },

    async loadModels() {

        try {

            const models = await ChatManager.adapter.listModels()

            const select = $("#model-select")

            select.empty()

            models.forEach(m => {

                select.append(`
                <option value="${m}">
                    ${m}
                </option>
            `)

            })

            UI.currentModel = models[0]

        }
        catch (e) {

            $("#connection-badge")
                .removeClass()
                .addClass("badge bg-danger")
                .text("Connection Failed")

        }

    },

    renderChatMessages(chat) {
        const container = $("#chat-messages");
        container.empty();
        chat.messages.forEach(msg => this.addMessage(msg));
        container.scrollTop(container.prop("scrollHeight"));
    },

    updateMessage(bubbleId, content) {
        const html = content ? marked.parse(content) : "";
        $(`#${bubbleId}`).html(html);
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    },

    startTyping(bubbleId) {
        let dots = 0;
        const interval = setInterval(() => {
            dots = (dots + 1) % 4;
            $(`#${bubbleId}`).text('.'.repeat(dots));
            $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
        }, 400);
        return interval;
    },

    stopTyping(interval, bubbleId, content) {
        clearInterval(interval);
        this.updateMessage(bubbleId, content);
    },

    addMessage(msg, options = {}) {
        const cls = msg.role === "user" ? "message-user" : "message-assistant";
        const bubbleId = options.id || crypto.randomUUID();
        const contentHtml = msg.content ? marked.parse(msg.content) : "";
        const messageHTML = `
            <div class="message ${cls}">
                <div class="message-bubble" id="${bubbleId}">${contentHtml}</div>
            </div>
        `;
        $("#chat-messages").append(messageHTML);
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
        return bubbleId;
    },

    updateLastMessage(text) {
        $("#chat-messages .message:last .message-bubble").text(text);
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    },

    renderChatList() {
        // Render list of chats in sidebar
        ChatDB.getChats().then(chats => {
            const container = $("#chat-list");
            container.empty();
            chats.forEach(chat => {
                container.append(`
                    <li class="list-group-item chat-item" data-chat-id="${chat.id}">
                        ${chat.title}
                    </li>
                `);
            });

            // Bind click to load chat
            $(".chat-item").click(async function () {
                const chatId = $(this).data("chat-id");
                await ChatManager.loadChat(chatId);
                $(".chat-item").removeClass("active");
                $(this).addClass("active");
            });
        });
    },

    async startTypingAnimation() {
        let dots = 0;
        const el = $('<span class="typing">...</span>');
        $("#chat-messages").append(`
            <div class="message message-assistant">
                <div class="message-bubble" id="assistant-typing"></div>
            </div>
        `);
        const interval = setInterval(() => {
            dots = (dots + 1) % 4;
            $("#assistant-typing").text('.'.repeat(dots));
        }, 400);
        return interval;
    },

    updateConnectionStatus(state, message = "") {

        const badge = $("#connection-badge")
        const footer = $("#status-connection")

        switch (state) {

            case "not_connected":
                badge
                    .removeClass()
                    .addClass("badge bg-secondary")
                    .text("Not Connected")
                footer.text("Not connected")
                break

            case "connecting":
                badge
                    .removeClass()
                    .addClass("badge bg-warning")
                    .text("Connecting…")
                footer.text(message || "Connecting to server…")
                break

            case "connected":
                badge
                    .removeClass()
                    .addClass("badge bg-success")
                    .text("Connected")
                footer.text(message || "Connected")
                break

            case "failed":
                badge
                    .removeClass()
                    .addClass("badge bg-danger")
                    .text("Connection Failed")
                footer.text(message || "Connection failed")
                break

        }

    },

    updatePerformance({ vram, tokensPerSec, latency, model }) {
        const perfDiv = $("#status-performance");
        perfDiv.text(`
            VRAM: ${vram ?? '--'} | 
            Tokens/sec: ${tokensPerSec ?? '--'} | 
            Latency: ${latency ?? '--'} ms | 
            Model: ${model ?? '--'}
        `);
    }

}