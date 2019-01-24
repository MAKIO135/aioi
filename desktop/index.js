const {app, BrowserWindow} = require('electron')
const config = require('./src/config.json')

app.win = null

app.on('ready', () => {
	app.win = new BrowserWindow({
		// titleBarStyle: 'hidden',
		width: config.width,
		height: config.height,
		minWidth: 320,
		minHeight: 160,
		frame: process.platform === 'win32',
		resizable: true,
		// icon: __dirname + '/icon.ico',
		// transparent: process.platform !== 'win32',
		skipTaskbar: process.platform !== 'win32',
		autoHideMenuBar: process.platform !== 'win32'
	})

	app.win.loadFile('index.html')

	app.win.on('closed', () => {
		win = null
		app.quit()
	})
    
	app.on('window-all-closed', () => {
		app.quit()
	})
})

