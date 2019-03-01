const {app, BrowserWindow} = require('electron')

app.win = null

app.on('ready', () => {
	app.win = new BrowserWindow({
		width: 300,
		height: 330,
		minWidth: 250,
		minHeight: 160,
		resizable: true,
		icon: __dirname + '/icon.ico',
		frame: process.platform !== 'darwin',
		skipTaskbar: true,
		autoHideMenuBar: true
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

