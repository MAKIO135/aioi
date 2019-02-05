const fs = require('fs')
const osc = require('node-osc')

function displayTooltip(el, text) {
    const pos = el.getBoundingClientRect()
    const tooltip = document.getElementById('tooltip')
    tooltip.innerText = text
    
    tooltip.style.left = `${pos.x}px`
    tooltip.style.top = `${pos.y + 18}px`
    
    tooltip.classList.add('visible')
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip')
    tooltip.classList.remove('visible')
}

function focusContentEditable(el, startOffset, endOffset) {
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

function unfocus(el) {
    // Unfocus input
    el.blur()

    // Remove any selections already made
    const selection = window.getSelection()
    selection.removeAllRanges()
}

function bangHost(el) {
    // Timeout needed for transition
    el.parentElement.classList.add('active')
    if(el.timeout) clearTimeout(el.timeout)
    el.timeout = setTimeout(() => {
        el.parentElement.classList.remove('active')
    }, 0)
}

function updateConfig(data) {
    fs.writeFile('./src/config.json', JSON.stringify(data,null,4), 'utf8', error => {
        if(error) {
            console.log({ error })
            return
        }

        console.log('config.json updated.')
    })
}

function formatHost(host) {
    host = host.match(/\b(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]):[0-9]+\b/)
    return host ? host[0] : false
}

function parseInputMsg(data) {
    const parseInputArg = arg => {
        // Float
        if (/\b\d+\.d?\b/.test(arg) || /\b\d?\.d+\b/.test(arg)) {
            return { type: 'f', value: parseFloat(arg) }
        }
        // Integer
        else if (/\b\d+\b/.test(arg)) {
            return parseInt(arg)
        }
        // String
        return `${arg}`
    }

    const [path, ...args] = data.split(' ').filter(d => d !== '')
    const oscMsg = new osc.Message(`${path}`)

    // console.log(args.map(parseInputArg))

    args.map(parseInputArg)
        .forEach(arg => oscMsg.append(arg))

    return oscMsg
}

function parseOrcaMsg(data) {
    const parseOrcaArg = arg => {
        // Float
        if (/\b\d+f\b/.test(arg)) {
            return { type: 'f', value: parseInt(arg) / 10.0 }
        }
        // Integer
        else if (/\b\d+\b/.test(arg)) {
            return parseInt(arg)
        }
        // Single char converted to Base 36 Integer
        else if (/\b\w\b/.test(arg)) {
           return parseInt(arg, 36)
        }
        // String
        return `${arg}`
    }

    const [clientPath, ...args] = `${data}`.split(';')

    let indexes = [0]
    let path = clientPath
    if(clientPath.includes('#')) {
        const [clientArg, pathArg] = clientPath.split('#')
        indexes = clientArg.split('').map(d=>parseInt(d,36))
        path = pathArg
    }
    
    const inputMsg = [`/${path}`]
    const oscMsg = new osc.Message(`/${path}`)

    args.map(parseOrcaArg)
        .forEach(arg => {
            inputMsg.push(arg.value || arg)
            oscMsg.append(arg)
        })

    return {
        indexes,
        inputMsg: inputMsg.join(' '),
        oscMsg
    }
}

module.exports = {
    formatHost,
    parseInputMsg,
    parseOrcaMsg,
    focusContentEditable,
    unfocus,
    displayTooltip,
    hideTooltip,
    bangHost,
    updateConfig
}