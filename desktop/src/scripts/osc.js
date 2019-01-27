const osc = (() => {
    const osc = require('node-osc')

    let clients = []

    const createClient = (ip, port) => clients.push(new osc.Client(ip, port))

    const updateClient = (index, ip, port) =>  clients.splice(index, 1, new osc.Client(ip, port))

    const removeClient = index => clients.splice(index, 1)

    const send = (indexes, msg) => {
        indexes.forEach(index => {
            clients[index].send(msg, err => {
                if(err) console.warn(err)
            })
        })
    }

    return {
        createClient,
        updateClient,
        removeClient,
        send
    }
})()

module.exports = osc