const {app, BrowserWindow} = require('electron')

app.win = null
app.config = require('./src/config.json')

app.on('ready', () => {
	app.win = new BrowserWindow({
		width: app.config.width,
		height: app.config.height,
		minWidth: 250,
		minHeight: 160,
		resizable: true,
		icon: __dirname + '/icon.ico',
		frame: process.platform !== 'darwin',
		skipTaskbar: process.platform === 'darwin',
		autoHideMenuBar: process.platform === 'darwin'
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

