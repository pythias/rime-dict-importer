const { app, BrowserWindow, Menu, electron } = require('electron');
const log = require('electron-log');

let mainWindow;

const Store = require('./src/store')
const store = new Store();

const debug = /--debug/.test(process.argv[2]);

function createWindow() {
    loadMainProcess();

    mainWindow = new BrowserWindow({
        width: 960,
        height: 720,
        minHeight: 480,
        minWidth: 600,
        fullscreenWindowTitle: "中州韵词库管理",
        webPreferences: {
            nodeIntegration: true
        },
    });

    if (debug) {
        mainWindow.webContents.openDevTools();
        mainWindow.maximize();
    } else {
        restoreState();
    }

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', function () {
        mainWindow = null
    });

    mainWindow.on('moved', function(e) {
        saveState();
    });

    mainWindow.on('resize', function(e) {
        saveState();
    });

    initMenu();
}

app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

function loadMainProcess() {
    require('./main-process/dicts/import')
    require('./main-process/dicts/download')
    require('./main-process/system/rime')
}

function initMenu() {
    if (process.platform !== 'darwin') {
        Menu.setApplicationMenu(null);
        return;
    }

    let template = [{
        label: app.getName(),
        submenu: [{
            label: '退出',
            role: 'quit',
            accelerator: 'CmdOrCtrl+Q',
            click() {
                app.quit();
            }
        }]
    }];
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function saveState() {
    if (mainWindow == null) {
        return;
    }
    store.set("state.position", mainWindow.getPosition());
    store.set("state.size", mainWindow.getSize());
}

function restoreState() {
    if (mainWindow == null) {
        return;
    }

    const position = store.get("state.position");
    const size = store.get("state.size");
    if (position == null || size == null) {
        return;
    }

    mainWindow.setPosition(position[0], position[1]);
    mainWindow.setSize(size[0], size[1]);
}