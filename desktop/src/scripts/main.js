const { app } = require('electron').remote

const udp = require('./udp')
const osc = require('./osc')
const ui = require('./ui')

const hosts = [... new Set(app.config.hosts)]

addEventListener('load', () => {
    ui.init(hosts)
    osc.init(hosts)
    udp.bind(app.config.ORCA_PORT)

    udp.on('message', msg => {
        console.log(`udp got: ${msg}`)
        osc.send(msg)
    })

    ui.on('add', () => {
        // osc.addClient(<hostIP:port>)
        // update config.json
    })
    ui.on('update', () => {
        // osc.updateClient(index, <hostIP:port>)
        // update config.json
    })
    ui.on('remove', () => {
        // osc.removeClient(index)
        // update config.json
    })
})