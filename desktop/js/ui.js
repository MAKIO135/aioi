module.exports = (app) => {
    const helpers = require('./helpers')(app);

    const theme = new Theme({
        background: '#000000',
        f_high: '#ffffff',
        f_med: '#777777',
        f_low: '#444444',
        f_inv: '#000000',
        b_high: '#eeeeee',
        b_med: '#72dec2',
        b_low: '#444444',
        b_inv: '#ffb545'
    });
    theme.install(document.body);
    theme.start();

    const hostsList = document.getElementById('hosts');
    const addButton = document.querySelector('[data-action="add"]');

    // Used to prevent checking blur event after 'Enter'
    let lastKey = undefined;

    const validateHost = (el, host) => {
        const inputString = el.innerText.trim();
        const index = parseInt(el.dataset.index);

        // Remove host if empty
        if (inputString === '') {
            if(index < app.config.hosts.length) {
                app.config.hosts.splice(index, 1);
                app.clients.removeClient(index);
                helpers.saveConfig();
            }
            
            unfocus(el);
            hideTooltip();
            el.parentElement.remove();
            app.win.setContentSize(app.win.getContentSize()[0], addButton.getBoundingClientRect().bottom + 30);

            // re-index all
            return document.querySelectorAll('ul#hosts li').forEach((li, i) => {
                if(li.querySelector('p').dataset.action) return;

                li.querySelector('.index').innerText = i.toString(36).toUpperCase();
                li.querySelector('.host').dataset.index = i;
                li.querySelector('.type').dataset.index = i;
                li.querySelector('.msg').dataset.index = i;
            });
        }
        
        // check ip:port host format
        const hostString = helpers.formatHost(inputString);
        if (!hostString) {
            displayTooltip(el, 'Wrong format');
            return focusContentEditable(el, inputString.length, inputString.length);
        }

        // Port between 1000 and 99999
        let [ip, port] = hostString.split(':');
        port = parseInt(port);
        if (port < 1000 || port > 99999) {
            displayTooltip(el, 'Wrong port number');
            const start = ip.length + 1;
            const end = hostString.length;
            return focusContentEditable(el, start, end);
        }
        
        // Check if host already exists
        if (app.config.hosts.some((h, i) => h.ip === ip && h.port === port && i !== index)) {
            displayTooltip(el, 'Already exists');
            return focusContentEditable(el, inputString.length, inputString.length);
        }

        // make sure hostString is well formated
        el.innerText = hostString;

        // Unfocus and hide tooltip
        unfocus(el);
        hideTooltip();
        
        // Add to hosts only if new
        if (hostString !== el.dataset.host) {
            host.ip = ip;
            host.port = port;
            console.log(`add new host: ${host.ip}:${host.port}`);
            
            // Update or add host
            if(el.dataset.isNew) {
                app.config.hosts.push(host);
                app.clients.createClient(ip, port);
                el.removeAttribute('data-isNew');
            }
            else {
                app.config.hosts.splice(index, 1, host);
                app.clients.updateClient(index, host);
            }
            helpers.saveConfig();
            el.dataset.host = host;
        }
    };
        
    const focusContentEditable = (el, startOffset, endOffset) => {
        let range;
        let selection;

        // Create a range (a range is a like the selection but invisible)
        range = document.createRange();

        if (startOffset !== undefined && endOffset !== undefined) {
            range.setStart(el.childNodes[0], startOffset);
            range.setEnd(el.childNodes[0], endOffset);
        }
        else {
            // Select the entire contents of the element with the range
            range.selectNodeContents(el);

            // Collapse the range to the end point. false means collapse to end rather than the start
            range.collapse(false);
        }

        // Get the selection object (allows you to change selection)
        selection = window.getSelection();

        // Remove any selections already made
        selection.removeAllRanges();

        // Make the range you have just created the visible selection
        selection.addRange(range);
    };

    const unfocus = (el) => {
        // Unfocus input
        el.blur();

        // Remove any selections already made
        const selection = window.getSelection();
        selection.removeAllRanges();
    };

    const displayTooltip = (el, text) => {
        const pos = el.getBoundingClientRect();
        const tooltip = document.getElementById('tooltip');
        tooltip.innerText = text;
        
        tooltip.style.left = `${pos.x}px`;
        tooltip.style.top = `${pos.y + 18}px`;
        
        tooltip.classList.add('visible');
    };

    const hideTooltip = () => {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.remove('visible');
    };

    const addHostLi = (host, isNew = true) => {
        if(tooltip.classList.contains('visible')) return;
        
        let index = [...document.querySelectorAll('li.host')].length;

        const li = document.createElement('li');
        li.classList.add('host');
        li.dataset.index = index;

        const { ip, port, type, udpString, oscString } = host;

        const hostString = `${ip}:${port}`;

        li.innerHTML = `<p class="index">${index.toString(36).toUpperCase()}</p>
            <p class="host" data-index="${index}" data-host="${isNew ? '' : hostString}" data-isNew="true" contenteditable="true">${hostString}</p>
            <p class="type" data-index="${index}"><span ${type === 'osc' ? 'class="selected"' : null} data-type="osc">OSC</span>|<span ${type === 'udp' ? 'class="selected"' : null} data-type="udp">UDP</span></p>
            <p class="msg" data-index="${index}" contenteditable="true">${type === 'udp' ? udpString : oscString}</p>`;

        li.querySelectorAll('p[contenteditable]').forEach((el) => {
            el.addEventListener('keydown', (e) => {
                lastKey = e.key;
    
                if (e.key === 'Enter') {
                    e.preventDefault();
    
                    if (el.classList.contains('host')) {
                        validateHost(el, host);
                    }
                    else if (el.classList.contains('msg')) {
                        const index = parseInt(el.dataset.index, 36);
                        app.clients.sendFromInput(index, el.innerText);
                    }
                }
            });
    
            el.addEventListener('blur', (e) => {
                e.preventDefault();
                if (lastKey !== 'Enter' && el.classList.contains('host')) {
                    validateHost(el, host);
                }
            });
        });

        li.querySelectorAll('p.type>span').forEach((el) => {
            el.addEventListener('click', (e) => {
                if (!el.classList.contains('selected')) {
                    el.parentNode.querySelector('.selected').classList.remove('selected');
                    el.classList.add('selected');

                    const index = el.parentNode.dataset.index;
                    const host = app.config.hosts[index];
                    host.type = el.dataset.type;
                    li.querySelector('.msg').innerText = host.type === 'udp' ? host.udpString : host.oscString;
                    app.clients.updateClient(index, host);
                    helpers.saveConfig();
                }
            });
        });

        hostsList.insertBefore(li, addButton.parentElement);

        if (isNew) {
            const el = li.querySelector('p.host');
            const start = hostString.indexOf(':') + 1;
            const end = hostString.length;
            focusContentEditable(el, start, end);
        }
    };

    // init hosts list
    app.config.hosts.forEach((host) => addHostLi(host, false));

    addEventListener('load', () => app.win.setContentSize(app.config.width, app.config.height));

    addEventListener('resize', helpers.debounce((e) => {
        // update config
        const dimensions = app.win.getContentSize();
        app.config.width = dimensions[0];
        app.config.height = dimensions[1];
        helpers.saveConfig();
    }, 1000));

    addButton.addEventListener('click', (e) => {
        if (document.querySelector('p.host[data-isNew]')) {
            const el = document.querySelector('p.host[data-isNew]');
            const index = el.dataset.index;
            validateHost(el, app.config.hosts[index]);
        }

        let newHost;
        if (app.config.hosts.length > 0) {
            const lastHost = app.config.hosts[app.config.hosts.length - 1];
            newHost = {
                ip: lastHost.ip,
                port: lastHost.port + 1,
                type: lastHost.type,
                oscString: '',
                udpString: ''
            };
        }
        else {
            newHost = {
                ip: '127.0.0.1',
                port: 8000,
                type: 'osc',
                path: '/yo',
                oscString: '/yo 135 2.4 test'
            };
        }

        addHostLi(newHost);
        app.win.setContentSize(app.win.getContentSize()[0], addButton.getBoundingClientRect().bottom + 30);
    });

    return {
        bangHost: (index) => {
            const el = document.querySelector(`li[data-index='${index}']`);
            el.style.animation = 'none';
            el.offsetHeight; /* trigger reflow */
            el.style.animation = null; 
            const host = app.config.hosts[index];
            el.querySelector('p.msg').innerText = host.type === 'udp' ? host.udpString : host.oscString; 
        }
    };
};