const ChatDB = {

key:"ellem_chats",

async init(){

    if(!localStorage.getItem(this.key)){
        localStorage.setItem(this.key, JSON.stringify([]))
    }

},

async createChat(){

    let chats = await this.getChats()

    const chat = {
        id:crypto.randomUUID(),
        title:"New Chat",
        messages:[]
    }

    chats.push(chat)

    localStorage.setItem(this.key, JSON.stringify(chats))

    return chat

},

async getChats(){

    return JSON.parse(localStorage.getItem(this.key))

},

async saveChat(chat){

    let chats = await this.getChats()

    const index = chats.findIndex(x=>x.id===chat.id)

    chats[index] = chat

    localStorage.setItem(this.key, JSON.stringify(chats))

}

}