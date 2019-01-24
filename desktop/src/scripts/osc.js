const osc = require('node-osc')
const helpers = require('./helpers')

class Osc {
    constructor() {
        this.config = require('./config.json')
        this.config.clients = [... new Set(this.config.clients)]
        this.clients = this.config.clients.map(client => {
            const {host, port} = helpers.parseClient(client)
            return new osc.Client(host, port)
        })
    }

    logClients() {
        console.log('OSC clients:')
        this.clients.forEach((client, i) => console.log(`#${i} ${client.host}:${client.port}`))
    }

    addClient(client) {
        if(!this.config.clients.includes(client)) {
            const {host, port} = helpers.parseClient(client)
            this.clients.push(new osc.Client(host, port))
            this.config.clients.push(client)
        }
        this.logClients()
    }

    removeClient(clientId) {
        this.clients.splice(clientId, 1)
        this.config.clients.splice(clientId, 1)
        helpers.updateConfig(this.config)
        this.logClients()
    }

    parseArg(arg) {
        // Float
        if (/\b\d+f\b/.test(arg)) {
            return { type: 'f', value: parseInt(arg) / 10.0 }
        }
        // Integer
        else if (/\b\d+\b/.test(arg)) {
            return parseInt(arg)
        }
        // Single char converted to Base 36 Integer
        else if (/\b\w\b/.test(arg)) {
           return parseInt(arg, 36)
        }
        // String
        return `${arg}`
    }

    parseMsg(data) {
        const [clientPath, ...args] = data.split(';')
        const [clientArg, path] = clientPath.split('#')
        const clientIds = clientArg === '' ? [0] : 
            clientArg.split('').map(d=>parseInt(d,36))
        
        return {
            clientIds,
            path,
            args: args.filter(arg => arg !== '').map(arg => this.parseArg(arg))
        }
    }
    
    send(data) {
        const {clientIds, path, args} = this.parseMsg(`${data}`)
        const oscMsg = new osc.Message(`/${path}`)
        args.forEach(arg => oscMsg.append(arg))

        clientIds.forEach(clientId => {
            this.clients[clientId].send(oscMsg, err => {
                if(err) console.warn(err)
            })
        })
    }
}

module.exports = function(config){
    return new Osc(config)
}