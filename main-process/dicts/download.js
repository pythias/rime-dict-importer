const { ipcMain } = require('electron');
const { downloadFile } = require('../../src/download')

ipcMain.on('event-dict-download-begin', (event, dict) => {
    downloadFile(event, dict);
});

ipcMain.on('event-dict-parse-completed', (event, dict) => {
    event.sender.send('event-dict-parse-completed', dict);
});
