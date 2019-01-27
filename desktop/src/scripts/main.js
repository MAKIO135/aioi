const { app } = require('electron').remote
const udp = require('./udp')
const osc = require('./osc')
const helpers = require('./helpers')

function validateHost(el) {
    let host = el.innerText.trim()
    const index = parseInt(el.dataset.index)
    console.log({host, index})

    // Remove host if empty
    if(host === '') {
        if(index < hosts.length) {
            hosts.splice(index, 1)
            osc.removeClient(index)
            app.config.hosts = hosts
            helpers.updateConfig(app.config)
        }

        helpers.unfocus(el)
        el.parentElement.remove()

        // Reindex all
        document.querySelectorAll('ul#hosts li p.index:not([data-action])').forEach((el, i) => {
            el.innerText = i.toString(36).toUpperCase()
        })

        return
    }

    // check ip:port host format
    host = helpers.formatHost(host)
    if(!host) {
        helpers.displayTooltip(el, 'Wrong format')
        return
    }

    // Port between 1000 and 99999
    const [ip, port] = host.split(':')
    if(port < 1000 || port > 99999) {
        helpers.displayTooltip(el, 'Wrong port number')
        return
    }
    
    // Check if host already exists
    if(hosts.indexOf(host) >= 0 && host !== el.dataset.host) {
        helpers.displayTooltip(el, 'Already exists')
        return
    }

    // Unfocus and hide tooltip
    helpers.unfocus(el)
    helpers.hideTooltip()
    
    // Add to hosts only if new
    if(host !== el.dataset.host) {
        // Update or add host
        if(index < hosts.length) {
            hosts.splice(index, 1, host)
            osc.updateClient(index, ip, port)
        }
        else {
            hosts.push(host)
            osc.createClient(ip, port)
        }
        app.config.hosts = hosts
        helpers.updateConfig(app.config)
        el.dataset.host = host
        el.innerText = host

    }
}

function attachListener(el) {
    el.addEventListener('keydown', e => {
        lastKey = e.key

        if(e.key === 'Enter') {
            e.preventDefault()

            if(el.classList.contains('host')) {
                validateHost(el)
            }
            else if(el.classList.contains('msg')) {
                const index = parseInt(el.dataset.index)
                // parse msg
                const oscMsg = helpers.parseInputMsg(el.innerText)
                osc.send([index], oscMsg)
                helpers.bangHost(el)
            }
        }
    })

    el.addEventListener('blur', e => {
        e.preventDefault()
        if(lastKey !== 'Enter' && el.classList.contains('host')) {
            validateHost(el)    
        }
    })
}

function addHostLi(host, selected = true) {
    if(tooltip.classList.contains('visible')) return
    
    let index
    if(host) {
        index = hosts.indexOf(host)
    }
    else {
        host = hosts[hosts.length - 1] || '127.0.0.1:8000'
        index = hosts.length
    }

    const li = document.createElement('li')
    li.innerHTML = [
        `<p class="index">${index.toString(36).toUpperCase()}</p>`,
        `<p class="host" data-index="${index}" data-host="${host}" contenteditable="true">${host}</p>`,
        `<p class="msg" data-index="${index}" contenteditable="true">/</p>`
    ].join('')
    li.querySelectorAll('p[contenteditable]').forEach(el => attachListener(el))
    hostsList.insertBefore(li, addButton.parentElement)

    if(selected) {
        const el = li.querySelector('p.host')
        const start = host.indexOf(':') + 1
        const end = host.length        
        helpers.focusContentEditable(el, start, end)
    }
}

const hostsList = document.getElementById('hosts')
const addButton = document.querySelector('[data-action="add"]')

// Used to prevent checking blur event after 'Enter'
let lastKey = undefined

addButton.addEventListener('click', e => addHostLi())
document.querySelector('#shortcuts p').addEventListener('click', () => shortcuts.classList.toggle('open'))


let hosts = [... new Set(app.config.hosts.map(helpers.formatHost).filter(d => d))]

hosts.forEach(host => {
    addHostLi(host, false)
    const [ip, port] = host.split(':')
    osc.createClient(ip, port)
})

udp.bind(app.config.ORCA_PORT)

udp.on('message', msg => {
    console.log(`udp got: ${msg}`)
    const {indexes, inputMsg, oscMsg} = helpers.parseOrcaMsg(msg)
    osc.send(indexes, oscMsg)
    indexes.forEach(index => {
        const el = document.querySelector(`.msg[data-index="${index}"]`)
        el.innerText = inputMsg
        helpers.bangHost(el)
    })
})