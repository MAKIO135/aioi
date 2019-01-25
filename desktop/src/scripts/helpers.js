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

    focusContentEditable: (el, startOffset, endOffset) => {
        let range
        let selection
    
        // Create a range (a range is a like the selection but invisible)
        range = document.createRange()
    
        if (startOffset !== undefined && endOffset !== undefined) {
            range.setStart(el.childNodes[0], startOffset)
            range.setEnd(el.childNodes[0], endOffset)
        } else {
            // Select the entire contents of the element with the range
            range.selectNodeContents(el)
    
            // Collapse the range to the end point. false means collapse to end rather than the start
            range.collapse(false)
        }
    
        // Get the selection object (allows you to change selection)
        selection = window.getSelection()
    
        // Remove any selections already made
        selection.removeAllRanges()
    
        // Make the range you have just created the visible selection
        selection.addRange(range)
    }
}