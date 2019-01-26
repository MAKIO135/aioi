const { app } = require('electron').remote
const udp = require('./udp')
const osc = require('./osc')
const helpers = require('./helpers')


function attachListener(el) {
    el.addEventListener('keydown', e => {
        if(e.key === 'Enter') {
            e.preventDefault()

            if(el.classList.contains('host')){
                let host = el.innerText

                // check ip:port host format
 
                // port between 1000 and 99999
                
                // check if host already exists
                if(hosts.indexOf(host) >= 0) {
                    displayTooltip(el, 'Already exists')
                    return
                }

                // add to hosts
                // hosts.push(host)

                // create OSC Client
                // osc.addClient(host)
            }
            else if(el.classList.contains('msg')){
                // parse msg
                // osc.sendMessage
            }
        }
    })

    el.addEventListener('keyup', e => {
        if(e.key.length === 1)
        console.log('keyup', el.innerText)
        //onKeyDown(el, e)
    })

    el.addEventListener('blur', e => {
        if(el.classList.contains('host')) {
            const input = e.target.innerText
            console.log(input)

            if(hosts.indexOf(input) >= 0) {
                displayTooltip(el, 'Already exists')

                const start = el.innerText.indexOf(':') + 1
                const end = el.innerText.length
                helpers.focusContentEditable(el, start, end)
                return
            }
            else {
                hosts.push(input)
                osc.addClient(input)
                tooltip.classList.remove('visible')
            }
        }
    })
}

function onKeyDown(el, e) {
    // Enter key
    if(e.which === 13) {
        e.preventDefault()

        if(el.classList.contains('host')) {
            if(hosts.indexOf(el.innerText) >= 0) {
                displayTooltip(el, 'Already exists')
                return
            }

            // Unfocus input
            el.blur()

            // Remove any selections already made
            const selection = window.getSelection()
            selection.removeAllRanges()

            // Empty value, remove li
            if(el.innerText === '') {
                el.parentElement.remove()

                // Reindex all
                document.querySelectorAll('ul#hosts li p.index:not([data-action])').forEach((el, i) => {
                    el.innerText = i.toString(36).toUpperCase()
                })
            }
        }
        else if(el.classList.contains('msg')) {
            el.parentElement.classList.add('active')

            // Timeout needed for transition
            if(el.timeout) clearTimeout(el.timeout)
            el.timeout = setTimeout(() => {
                el.parentElement.classList.remove('active')
            }, 0)

            const hostID = parseInt(el.parentElement.querySelector('p.index').innerText, 36)
            console.log({ hostID, msg: el.innerText })

            // TODO: send msg
            // osc.send(msg)
        }
    }
    else if(el.classList.contains('host')) {
        if(hosts.indexOf(input) >= 0) {
            displayTooltip(el, 'Already exists')
        }
        else {
            tooltip.classList.remove('visible')
        }
    }
}

function addHost(host, selected = true) {
    if(tooltip.classList.contains('visible')) return
    
    let index
    if(host) {
        index = hosts.indexOf(host)
    }
    else {
        host = hosts[hosts.length - 1] || '127.0.0.1:8000'
        index = hosts.length.toString(36).toUpperCase()
    }

    const li = document.createElement('li')
    li.innerHTML = `<p class="index">${index}</p><p class="host" contenteditable="true">${host}</p><p class="msg" contenteditable="true">/</p>`
    li.querySelectorAll('p[contenteditable]').forEach(el => attachListener(el))
    hostsList.insertBefore(li, addButton.parentElement)

    if(selected){
        const el = li.querySelector('p.host')
        const start = host.indexOf(':') + 1
        const end = host.length        
        helpers.focusContentEditable(el, start, end)
    }
}

function displayTooltip(el, text) {
    const pos = el.getBoundingClientRect()
    tooltip.innerText = text

    tooltip.style.left = `${pos.x}px`
    tooltip.style.top = `${pos.y + 20}px`

    tooltip.classList.add('visible')
}

const hostsList = document.getElementById('hosts')
const tooltip = document.getElementById('tooltip')
const addButton = document.querySelector('[data-action="add"]')

addButton.addEventListener('click', () => addHost())
document.querySelector('#shortcuts p').addEventListener('click', () => shortcuts.classList.toggle('open'))


let hosts = [... new Set(app.config.hosts.map(host => host.trim()).filter(host => /\b(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]):[0-9]{4,5}\b/.test(host)))]

hosts.forEach(host => {
    addHost(host, false)
    osc.addClient(hosts)
})

udp.bind(app.config.ORCA_PORT)

udp.on('message', msg => {
    console.log(`udp got: ${msg}`)
    osc.send(msg)
})