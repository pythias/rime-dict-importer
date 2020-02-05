const { ipcMain, dialog, ipcRenderer } = require('electron');
const log = require('electron-log');
const dictParser = require('../../src/parsers/parser');
const { Rime } = require('../../src/inputs/rime');

const rime = new Rime();

ipcMain.on("event-tools-rime-preload", (e) => {
    const dicts = rime.getDicts();
    dicts.forEach(dict => {
        e.sender.send('event-dict-load-completed', dict);
    });
    e.sender.send('event-tools-rime-loaded');
});

ipcMain.on("event-tools-rime-new-dict", (e, dict) => {
    rime.insertDict(dict);
});

ipcMain.on("event-tools-rime-update-dict", (e, dict) => {
    rime.updateDict(dict);
});

ipcMain.on("event-tools-rime-open-dict", (e, dict) => {
    rime.openDict(dict);
});

ipcMain.on("event-tools-rime-remove-dict", (e, dict) => {
    rime.removeDict(dict);
});

ipcMain.on("event-tools-rime-set-completed", (e) => {
    rime.reload();
    dialog.showMessageBox({message: "重新部署完毕"});
});