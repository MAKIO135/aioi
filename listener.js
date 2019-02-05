const osc = require('./desktop/node_modules/node-osc')

const config = require('./desktop/src/config.json')

config.hosts.forEach(host => {
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


