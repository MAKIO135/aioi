const {app, BrowserWindow} = require('electron')
const helpers = require('./src/scripts/helpers')

app.win = null
app.config = require('./src/config.json')

app.on('ready', () => {
	app.win = new BrowserWindow({
		// titleBarStyle: 'hidden',
		width: app.config.width,
		height: app.config.height,
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

	app.on('resize', () => {
		// update config.json
		// app.config.width = win.getWidth()
		// app.config.height = win.getHeight()
		// helpers.updateConfig(app.config)
	})
})
