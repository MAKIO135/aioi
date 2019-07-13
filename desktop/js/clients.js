module.exports = (app) => {
    const osc = require('node-osc');
    const dgram = require('dgram');
    const udpClient = dgram.createSocket('udp4');
    const helpers = require('./helpers')(app);

    class Client {
        constructor(host) {
            Object.keys(host).forEach(key => this[key] = host[key]);
            
            if (this.type === 'udp') {
                this.client = udpClient;
            }
            else {
                this.client = new osc.Client(this.ip, this.port);
            }
        }

        send(msg, callback) {
            if (this.type === 'udp') {
                this.client.send(msg, 0, msg.length, this.port, this.ip, callback);
                // console.log(`UDP: ${this.udpString}`);
            }
            else {
                this.client.send(msg, callback);
                // console.log(`OSC: ${this.oscString}`);
            }
        }
    }

    const clients = [];

    const createClient = (host) => clients.push(new Client(host));
    const updateClient = (index, host) =>  clients.splice(index, 1, new Client(host));
    const removeClient = (index) => clients.splice(index, 1);
    const sendCallback = (err) => err ? console.warn(err) : 1;
  
    const sendFromOrca = (msg) => {
        const [clientPath, ...args] = `${msg}`.split(';');
        let indices = [0];
        let path = `/${clientPath}`;
        let udpMsg = msg;
        const oscArgs = args.map((arg) => {
            // Float
            if (/\b\d+f\b/.test(arg)) return { type: 'f', value: parseInt(arg) / 10.0 };
            // Integer
            else if (/\b\d+\b/.test(arg)) return parseInt(arg);
            // Single char converted to Base 36 Integer
            else if (/\b\w\b/.test(arg)) return parseInt(arg, 36);
            // String
            return `${arg}`;
        });

        if (clientPath.startsWith('#')) { // specified hosts omitted path
            indices = [...clientPath.slice(1)].map((c) => parseInt(c, 36));
            udpMsg = Buffer.from(args.join(';'));
            
            indices.filter((index) => index < clients.length)
                .forEach((index) => {
                    const client = clients[index];
                    let path = client.path;
                    if (!path) path = client.path = '/';
                    const oscMsg = new osc.Message(path);
                    oscArgs.forEach(arg => oscMsg.append(arg));
                    client.send(client.type === 'udp' ? udpMsg : oscMsg, sendCallback);

                    client.oscString = oscArgs.reduce((acc, arg) => {
                        return acc.concat(arg.value !== undefined ? arg.value : arg);
                    }, [path]).join(' ');
                    client.udpString = `${udpMsg}`;
                    
                    const updatedHost = {
                        ...client
                    };
                    delete updatedHost.send;
                    app.config.hosts[index] = updatedHost;
                    helpers.saveConfig();
                    
                    app.ui.bangHost(index);
                });

            return;
        }
        
        if (clientPath.includes('#')) { // specified hosts 
            const [clientArg, pathArg] = clientPath.split('#');
            indices = clientArg.split('').map(d=>parseInt(d, 36));
            path = `/${pathArg}`;
            udpMsg = Buffer.from(`${msg}`.split('#')[1]);
        }
        
        const oscMsg = new osc.Message(path);
        oscArgs.forEach(arg => oscMsg.append(arg));

        const oscString = oscArgs.reduce((acc, arg) => {
            return acc.concat(arg.value !== undefined ? arg.value : arg);
        }, [path]).join(' ');
        
        indices.filter((index) => index < clients.length)
            .forEach((index) => {
                const client = clients[index];
                client.send(client.type === 'udp' ? udpMsg : oscMsg, sendCallback);

                client.path = path;
                client.oscString = oscString;
                client.udpString = `${udpMsg}`;
                    
                const updatedHost = {
                    ...client
                };
                delete updatedHost.send;
                app.config.hosts[index] = updatedHost;
                helpers.saveConfig();
                
                app.ui.bangHost(index);
            });
    };

    const sendFromInput = (index, inputString) => {
        const client = clients[index];
        
        if (client.type === 'udp') {
            client.send(Buffer.from(inputString), sendCallback);
        }
        else {
            if (!inputString.startsWith('/')) {
                inputString = `/${inputString}`;
                document.querySelector(`p.msg[data-index="${index}"]`).innerText = inputString;
            }
            
            const [path, ...args] = inputString.split(' ').filter(d => d !== '');
            client.path = path;
            const oscMsg = new osc.Message(`${path}`);
        
            args.map((arg) => {
                    // Float
                    if (/\b\d+\.d?\b/.test(arg) || /\b\d?\.d+\b/.test(arg)) return { type: 'f', value: parseFloat(arg) };
                    // Integer
                    else if (/\b\d+\b/.test(arg)) return parseInt(arg);
                    // String
                    return `${arg}`;
                })
                .forEach(arg => oscMsg.append(arg));
            client.send(oscMsg, sendCallback);
        }

        client.oscString = client.udpString = inputString;
        
        const updatedHost = {
            ...client
        };
        delete updatedHost.send;
        app.config.hosts[index] = updatedHost;
        helpers.saveConfig();
        
        app.ui.bangHost(index);
    };

    app.config.hosts.forEach((host) => createClient(host));

    return {
        createClient,
        updateClient,
        removeClient,
        sendFromOrca,
        sendFromInput
    };
};