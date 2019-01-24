const ui = require('./ui')()
const udp = require('./udp')()
const osc = require('./osc')()

// Run app
ui.init()

udp.on('message', msg => {
    console.log(`udp got: ${msg}`)
    osc.send(msg)
})