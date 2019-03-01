const osc = require('./desktop/node_modules/node-osc')

const hosts = [
    '127.0.0.1:8000',
    '127.0.0.1:12000'
]

hosts.forEach(host => {
    const [ip, port] = host.split(':')
    const oscserver = new osc.Server(port, ip)
    console.log(`Started Listener OSC server: ${host}`)
    
    // Error
    oscserver.on('error', err => {
        console.log(`OSC server:\n${err.stack}`);
        oscserver.close();
    })
    
    // Message
    oscserver.on('message', msg => {
        console.log(`${host} ${msg}`)
    })
})


