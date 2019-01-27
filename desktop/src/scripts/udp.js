const dgram = require('dgram')
const server = dgram.createSocket('udp4')

const udp = (() => {
    server.on('error', err => {
        console.warn(`udp error: \n${err.stack}`)
        server.close()
    })

    const on = (event, callback) => {
        server.on(event, callback)
    }

    return { 
        on, 
        bind: port => server.bind(port)
    }
})()

module.exports = udp