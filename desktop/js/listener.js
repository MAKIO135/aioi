const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');

udpServer.on('error', (err) => {
    console.warn(`udp error:\n${err.stack}`);
    udpServer.close();
});

udpServer.bind(49161); // ORCA's UDP out port

module.exports = (app) => {
    udpServer.on('message', msg => {
        app.clients.sendFromOrca(msg);
    });
};