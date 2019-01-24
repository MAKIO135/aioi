module.exports = {
    updateConfig: data => {
        const fs = require('fs')
    
        fs.writeFile('config.json', JSON.stringify(data,null,4), 'utf8', error => {
            if(error) {
                console.log({ error })
                return
            }
    
            console.log('config.json updated.')
        })
    },

    parseClient: data => {
        const ipReg = /\b(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\b/
        const portReg = /\b\d{4,5}\b/
    
        const [host, port] = data.split(':')
        if(ipReg.exec(host)[0] === host && portReg.exec(port)[0] === port) return {host, port}
    
        console.error(`Could not parse <host:port>: ${data}`)
        process.exit(0)
    },
}