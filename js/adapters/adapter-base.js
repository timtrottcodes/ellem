class AdapterBase{

constructor(server){

    this.server = server

}

async listModels(){

    throw "listModels not implemented"

}

async chat(messages, onToken){

    throw "chat not implemented"

}

}