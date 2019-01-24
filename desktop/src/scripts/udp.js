const dgram = require('dgram')

class Udp {
    constructor() {
        this.server = dgram.createSocket('udp4')
        
        const ORCA_PORT = 49160
        this.server.bind(ORCA_PORT) // Listen for ORCA

        this.on('error', err => {
            console.warn(`udp error:\n${err.stack}`)
            this.server.close()
        })
    }

    on(event, callback) {
        this.server.on(event, callback)
    }
}

module.exports = function(){
    return new Udp()
}