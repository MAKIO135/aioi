const { app } = require('electron').remote;

const initConfig = () => {
    localStorage.setItem('config', JSON.stringify({
        width: 300,
        height: 330,
        hosts: [
            {
                ip: '127.0.0.1',
                port: 8000,
                type: 'osc',
                path: '/yo',
                oscString: '/yo 135 2.4 test'
            },
            {
                ip: '127.0.0.1',
                port: 12000,
                type: 'udp',
                udpString: 'abcdefg'
            }
        ],
        displayShortcuts: true
    }));
};

const loadConfig = () => {
    if (!localStorage.getItem('config')) initConfig();
    return JSON.parse(localStorage.getItem('config'));
};

app.config = loadConfig();

app.clients = require('./clients')(app);
app.listener = require('./listener')(app);
app.ui = require('./ui')(app);