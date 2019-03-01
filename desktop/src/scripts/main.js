const {app} = require('electron').remote
const udp = require('./udp')
const osc = require('./osc')
const helpers = require('./helpers')

const config = helpers.loadConfig()

const theme = new Theme({background: '#000000', f_high: '#ffffff', f_med: '#777777', f_low: '#444444', f_inv: '#000000', b_high: '#eeeeee', b_med: '#72dec2', b_low: '#444444', b_inv: '#ffb545'})
theme.install(document.body)
theme.start()

const hostsList = document.getElementById('hosts')
const addButton = document.querySelector('[data-action="add"]')
const shortcuts = document.getElementById('shortcuts')
const dragZone = document.getElementById('drag-zone')

// Used to prevent checking blur event after 'Enter'
let lastKey = undefined

let hosts = [... new Set(config.hosts.map(helpers.formatHost).filter(d => d))]

hosts.forEach(host => {
    addHostLi(host, false)
    const [ip, port] = host.split(':')
    osc.createClient(ip, port)
})

function validateHost(el) {
    const inputString = el.innerText.trim()
    const index = parseInt(el.dataset.index)

    // Remove host if empty
    if(inputString === '') {
        if(index < hosts.length) {
            hosts.splice(index, 1)
            osc.removeClient(index)
            config.hosts = hosts
            app.win.setContentSize(app.win.getContentSize()[0], shortcuts.getBoundingClientRect().bottom)
        }

        helpers.unfocus(el)
        helpers.hideTooltip()
        el.parentElement.remove()

        // Reindex all
        document.querySelectorAll('ul#hosts li').forEach((li, i) => {
            if(li.querySelector('p').dataset.action) {return}
            li.querySelector('.index').innerText = i.toString(36).toUpperCase()
            li.querySelector('.host').dataset.index = i
            li.querySelector('.msg').dataset.index = i
        })
        
        return
    }
    
    // check ip:port host format
    const host = helpers.formatHost(inputString)
    if(!host) {
        helpers.displayTooltip(el, 'Wrong format')
        helpers.focusContentEditable(el, inputString.length, inputString.length)
        return
    }

    // Port between 1000 and 99999
    const [ip, port] = host.split(':')
    if(port < 1000 || port > 99999) {
        helpers.displayTooltip(el, 'Wrong port number')
        const start = host.indexOf(':') + 1
        const end = host.length
        helpers.focusContentEditable(el, start, end)
        return
    }
    
    // Check if host already exists
    if(hosts.indexOf(host) >= 0 && hosts.indexOf(host) !== index) {
        helpers.displayTooltip(el, 'Already exists')
        helpers.focusContentEditable(el, inputString.length, inputString.length)
        return
    }

    // make sure host is well formated
    el.innerText = host

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
        config.hosts = hosts
        helpers.updateConfig(config)
        el.dataset.host = host
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

// Events
addEventListener('load', e => {
    app.win.setContentSize(config.width, config.height)
    if(config.displayShortcuts) shortcuts.classList.toggle('open')
})

addEventListener('resize', helpers.debounce(e => {
    // update config.json
    const dimensions = app.win.getContentSize()
    config.width = dimensions[0]
    config.height = dimensions[1]
    config.displayShortcuts = shortcuts.classList.contains('open')
    helpers.updateConfig(config)
}, 1000))

addButton.addEventListener('click', e => {
    addHostLi()
    app.win.setContentSize(app.win.getContentSize()[0], shortcuts.getBoundingClientRect().bottom)
})

shortcuts.querySelector('p').addEventListener('click', () => {
    shortcuts.classList.toggle('open')
    app.win.setContentSize(app.win.getContentSize()[0], shortcuts.getBoundingClientRect().bottom)
    config.width = innerWidth
    config.height = innerHeight
    config.displayShortcuts = shortcuts.classList.contains('open')
    helpers.updateConfig(config)
})

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

udp.bind(config.ORCA_PORT)