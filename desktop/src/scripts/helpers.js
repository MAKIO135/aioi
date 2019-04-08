const osc = require('node-osc')

const formatHost = host => {
    host = host.match(/\b(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]):[0-9]+\b/)
    return host ? host[0] : false
}

const parseInputMsg = data => {
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

const parseOrcaMsg = data => {
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

    if(clientPath.startsWith('#')) {
        indexes = [parseInt(clientPath[1], 36)]
        path = document.querySelector(`p.msg[data-index="${indexes[0]}"]`).innerText.split(' ')[0].substr(1)
    }
    else if(clientPath.includes('#')) {
        const [clientArg, pathArg] = clientPath.split('#')
        indexes = clientArg.split('').map(d=>parseInt(d, 36))
        path = pathArg
    }
    
    const inputMsg = [`/${path}`]
    const oscMsg = new osc.Message(`/${path}`)

    args.map(parseOrcaArg)
        .forEach(arg => {
            inputMsg.push(arg.value !== undefined ? arg.value : arg)
            oscMsg.append(arg)
        })

    return {
        indexes,
        inputMsg: inputMsg.join(' '),
        oscMsg
    }
}

const focusContentEditable = (el, startOffset, endOffset) => {
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

const unfocus = el => {
    // Unfocus input
    el.blur()

    // Remove any selections already made
    const selection = window.getSelection()
    selection.removeAllRanges()
}

const displayTooltip = (el, text) => {
    const pos = el.getBoundingClientRect()
    const tooltip = document.getElementById('tooltip')
    tooltip.innerText = text
    
    tooltip.style.left = `${pos.x}px`
    tooltip.style.top = `${pos.y + 18}px`
    
    tooltip.classList.add('visible')
}

const hideTooltip = () => {
    const tooltip = document.getElementById('tooltip')
    tooltip.classList.remove('visible')
}

const bangHost = el => {
    // Timeout needed for transition
    el.parentElement.classList.add('active')
    if(el.timeout) clearTimeout(el.timeout)
    el.timeout = setTimeout(() => {
        el.parentElement.classList.remove('active')
    }, 0)
}

const loadConfig = () => {
    if(!localStorage.getItem('config')) {
        const initialConfig = {
            ORCA_PORT: 49160,
            width: 300,
            height: 330,
            hosts: [
                '127.0.0.1:8000',
                '127.0.0.1:12000'
            ],
            displayShortcuts: true
        }
        localStorage.setItem('config', JSON.stringify(initialConfig))
    }
    return JSON.parse(localStorage.getItem('config'))
}

const updateConfig = data => {
    localStorage.setItem('config', JSON.stringify(data))
}

const debounce = (fn, ms = 0) => {
    let timeoutId
    return function(...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

const memoize = fn => {
    const cache = new Map()
    const cached = val => {
        return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val)
    }
    cached.cache = cache
    return cached
}

module.exports = {
    formatHost,
    parseInputMsg: memoize(parseInputMsg),
    parseOrcaMsg: memoize(parseOrcaMsg),
    focusContentEditable,
    unfocus,
    displayTooltip,
    hideTooltip,
    bangHost,
    loadConfig,
    updateConfig,
    debounce
}