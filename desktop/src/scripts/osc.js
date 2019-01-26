const osc = (() => {
    const osc = require('node-osc')
    const helpers = require('./helpers')

    let clients = []

    const logClients = () => {
        console.log('OSC clients:')
        clients.forEach((client, i) => console.log(`#${i} ${client.host}:${client.port}`))
    }

    const addClient = host => {
        const {ip, port} = helpers.parseHost(host)
        clients.push(new osc.Client(ip, port))
        logClients()
    }

    const removeClient = clientId => {
        clients.splice(clientId, 1)
        config.clients.splice(clientId, 1)
        logClients()
    }

    const parseArg = arg => {
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

    const parseMsg = data => {
        const [clientPath, ...args] = data.split(';')
        const [clientArg, path] = clientPath.split('#')
        const clientIds = clientArg === '' ? [0] : 
            clientArg.split('').map(d=>parseInt(d,36))
        
        return {
            clientIds,
            path,
            args: args.filter(arg => arg !== '').map(arg => parseArg(arg))
        }
    }
    
    const send = data => {
        const {clientIds, path, args} = parseMsg(`${data}`)
        const oscMsg = new osc.Message(`/${path}`)
        args.forEach(arg => oscMsg.append(arg))

        clientIds.forEach(clientId => {
            clients[clientId].send(oscMsg, err => {
                if(err) console.warn(err)
            })
        })
    }

    return {
        init,
        addClient,
        removeClient,
        send
    }
})()

module.exports = osc