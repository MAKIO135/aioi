const helpers = require('./helpers')
const { app } = require('electron').remote

app.udp = require('./udp')
app.osc = require('./osc')

let hosts = [... new Set(app.config.hosts)]


function attachListener(el) {
    el.addEventListener('keydown', e => {
        onKeyDown(el, e)
    })

    el.addEventListener('blur', e => {
        if (el.classList.contains('host')) {
            const input = e.target.innerText
            console.log(input)

            if (hosts.indexOf(input) >= 0) {
                displayTooltip(el, 'Already exists')

                const start = el.innerText.indexOf(':') + 1
                const end = el.innerText.length
                helpers.focusContentEditable(el, start, end)
                return
            }
            else {
                hosts.push(input)
                app.osc.addClient(input)
                tooltip.classList.remove('visible')
            }
        }
    })
}

function onKeyDown(el, e) {
    if (e.which === 13) {
        // Enter key
        e.preventDefault()

        const input = el.innerText

        if (el.classList.contains('host')) {
            if (hosts.indexOf(input) >= 0) {
                displayTooltip(el, 'Already exists')
                return
            }

            // Unfocus input
            input.blur()

            // Remove any selections already made
            const selection = window.getSelection()
            selection.removeAllRanges()

            // Empty value, remove li
            if (input.innerText === '') {
                input.parentElement.remove()

                // Reindex all
                document.querySelectorAll('ul#hosts li p.index:not([data-action])').forEach((el, i) => {
                    el.innerText = i.toString(36).toUpperCase()
                })
            }
        }
        else if (el.classList.contains('msg')) {
            el.parentElement.classList.add('active')

            // Timeout needed for transition
            if (el.timeout) clearTimeout(el.timeout)
            el.timeout = setTimeout(() => {
                el.parentElement.classList.remove('active')
            }, 0)

            const hostID = parseInt(el.parentElement.querySelector('p.index').innerText, 36)
            console.log({ hostID, msg: el.innerText })

            // TODO: send msg
            // app.osc.send(msg)
        }
    }
}

function addHost(host, selected = true) {
    if (tooltip.classList.contains('visible')) return
    
    if(typeof(host) !== 'string') {
        host = hosts[hosts.length - 1] || '127.0.0.1:8000'
    }

    const index = hosts.length.toString(36).toUpperCase()
    const li = document.createElement('li')
    li.innerHTML = `<p class="index">${index}</p><p class="host" contenteditable="true">${host}</p><p class="msg" contenteditable="true">/</p>`
    li.querySelectorAll('p').forEach(el => attachListener(el))
    document.getElementById('hosts').insertBefore(li, addButton.parentElement)

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


const tooltip = document.getElementById('tooltip')
const addButton = document.querySelector('[data-action="add"]')

addButton.addEventListener('click', addHost)
document.querySelector('#shortcuts p').addEventListener('click', () => shortcuts.classList.toggle('open'))

hosts.forEach(host => addHost(host, false))

app.osc.init(hosts)
app.udp.bind(app.config.ORCA_PORT)

app.udp.on('message', msg => {
    console.log(`udp got: ${msg}`)
    app.osc.send(msg)
})