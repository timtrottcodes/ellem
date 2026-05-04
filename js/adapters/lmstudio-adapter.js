class LMStudioAdapter extends AdapterBase{

async listModels(){

    const res = await fetch(`${this.server.url}/v1/models`)
    const json = await res.json()

    return json.data.map(x=>x.id)

}

async chat(messages,onToken){

    const res = await fetch(`${this.server.url}/v1/chat/completions`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            model:UI.currentModel,
            messages:messages,
            stream:true

        })

    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while(true){

        const {done,value} = await reader.read()

        if(done) break

        const chunk = decoder.decode(value)

        onToken(chunk)

    }

}

}

ApiRegistry.register("lmstudio", LMStudioAdapter)