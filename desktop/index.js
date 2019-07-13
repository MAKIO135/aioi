const { app, BrowserWindow } = require('electron');

app.win = null;

function createWindow () {
    app.win = new BrowserWindow({
        width: 291,
        height: 330,
		minWidth: 250,
		minHeight: 160,
		icon: __dirname + '/icon.ico',
		backgroundColor: 'black',
		frame: false,
		resizable: true,
		skipTaskbar: false,
		autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    app.win.loadFile('index.html');

	app.win.on('closed', () => {
		win = null;
		app.quit();
	});

	app.on('window-all-closed', () => app.quit());
};

app.on('ready', createWindow);