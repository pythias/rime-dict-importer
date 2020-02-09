const log = require('electron-log');
const {app, BrowserWindow} = require("electron");
const {download} = require("electron-dl");

module.exports = {
    // async downloadFile(event, dict) {
    //     const path = app.getPath("downloads") + "/rime";
    //     const dl = await download(BrowserWindow.getFocusedWindow(), dict.url, {directory: path});
    //     dict.path = dl.getSavePath();
    //     event.sender.send("event-dict-download-completed", dict);
    // }


    downloadFile(event, dict) {
        const path = app.getPath("downloads") + "/rime";
        download(BrowserWindow.getFocusedWindow(), dict.url, {directory: path}).then(dl => {
            dict.path = dl.getSavePath();
            event.sender.send("event-dict-download-completed", dict);
        }).finally(() => {
            
        });
    }
}