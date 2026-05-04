const ServerDB = {

key:"ellem_servers",

async init(){

    if(!localStorage.getItem(this.key)){
        localStorage.setItem(this.key, JSON.stringify([]))
    }

},

async ensureDefaults(){

    let servers = await this.getServers()

    if(servers.length === 0){

        servers.push({
            id:crypto.randomUUID(),
            name:"Local Ollama",
            type:"ollama",
            url:"http://localhost:11434"
        })

        localStorage.setItem(this.key, JSON.stringify(servers))

    }

},

async getServer(id){

    const servers = await this.getServers()

    return servers.find(x=>x.id===id)

},

async getServers(){

    return JSON.parse(localStorage.getItem(this.key))

},

async addServer(server){

    let servers = await this.getServers()

    servers.push(server)

    localStorage.setItem(this.key, JSON.stringify(servers))

}

}