class OllamaAdapter extends AdapterBase {

    async listModels() {

        const res = await fetch(`${this.server.url}/api/tags`)

        const json = await res.json()

        return json.models.map(x => x.name)

    }

    async chat(messages, onToken) {

        const res = await fetch(`${this.server.url}/api/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                model: UI.currentModel,
                messages: messages,
                stream: true

            })

        })

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {

            const { done, value } = await reader.read()

            if (done) break

            const chunk = decoder.decode(value)

            onToken(chunk)

        }

    }

    getVRAM() {
        // Example: return GPU memory usage if available
        return this.server.vramUsage ?? '--';
    }

}

ApiRegistry.register("ollama", OllamaAdapter)