const ApiRegistry = {

adapters:{},

register(type, adapter){

    this.adapters[type] = adapter

},

get(type){

    return this.adapters[type]

}

}