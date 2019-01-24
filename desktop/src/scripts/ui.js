const config = require('../config.json')

const addButton = document.querySelector('[data-action="add"]')

function attachListener(el) {
    el.addEventListener('keydown', (e) => {
        onKeyDown(el, e)
    })

    el.addEventListener('blur', (e) => {
        const input = e.target

        if (el.classList.contains('host')) {
            if (countInstances(input) > 1) {
                tooltip(el, 'Already exists')

                const start = el.innerText.indexOf(':') + 1
                const end = el.innerText.length

                focusContentEditable(el, start, end)
                return false
            } else {
                const tooltip = document.getElementById('tooltip')
                tooltip.classList.remove('visible')
            }
        }
    })
}

function onKeyDown(el, e) {
    if (e.which === 13) {
        // Enter key
        e.preventDefault()

        const input = e.target

        if (countInstances(input) > 1) {
            tooltip(el, 'Already exists')
            return false
        }

        if (el.classList.contains('host')) {
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
        } else if (el.classList.contains('msg')) {
            el.parentElement.classList.add('active')

            // Timeout needed for transition
            if (el.timeout) clearTimeout(el.timeout)
            el.timeout = setTimeout(() => {
                el.parentElement.classList.remove('active')
            }, 0)

            const hostID = parseInt(el.parentElement.querySelector('p.index').innerText, 36)
            console.log({ hostID, msg: el.innerText })

            // TODO: send msg
        }
    }
}

const addHost = (host = undefined, selected = true) => {
    const tooltip = document.querySelector('#tooltip')
    if (tooltip.classList.contains('visible')) return false

    // Get last host in list (before-last li)
    const before = document.querySelector('#hosts li:nth-last-child(-n+2)')

    if(host === undefined) {
        if (before.querySelector('p.host')) {
            host = before.querySelector('p.host').innerText
        }
        else {
            host = '127.0.0.1:8000'
        }
    }

    const nbHosts = document.querySelectorAll('ul#hosts li').length - 1
    const index = nbHosts.toString(36).toUpperCase()

    addButton.parentElement.insertAdjacentHTML('beforebegin', `<li><p class="index">${index}</p><p class="host" contenteditable="true">${host}</p><p class="msg" contenteditable="true">/</p></li>`)

    document.querySelectorAll('#hosts li:nth-last-child(-n+2) p').forEach(el => attachListener(el))

    if(selected){
        const start = host.indexOf(':') + 1
        const end = host.length
    
        const el = document.querySelector('#hosts li:nth-last-child(-n+2) p.host')
        focusContentEditable(el, start, end)
    }
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

function countInstances(input) {
    const instances = [...document.querySelectorAll('ul#hosts li p.host')].filter(host => host.innerText === input.innerText)
    return instances.length
}

function tooltip(el, text) {
    const tooltip = document.getElementById('tooltip')
    const pos = el.getBoundingClientRect()
    tooltip.innerText = text

    tooltip.style.left = `${pos.x}px`
    tooltip.style.top = `${pos.y + 20}px`

    tooltip.classList.add('visible')
}

addEventListener('load', () => {
    [... new Set(config.hosts)].forEach(host => addHost(host, false))

    document.querySelectorAll('[contenteditable="true"]').forEach(el => attachListener(el))

    addButton.addEventListener('click', addHost)

    const shortcuts = document.querySelector('#shortcuts')
    shortcuts.querySelector('p').addEventListener('click', () => shortcuts.classList.toggle('open'))
})