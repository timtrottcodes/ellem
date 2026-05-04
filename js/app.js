$(async function(){

    await ServerDB.init()
    await ChatDB.init()

    await ServerDB.ensureDefaults()

    await UI.loadServers()

    UI.bindEvents()

    const servers = await ServerDB.getServers()

    /*if(servers.length){
        await UI.connectServer(servers[0])
    }*/

    UI.updateConnectionStatus("not_connected")
})