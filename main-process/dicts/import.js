const { ipcMain, dialog } = require('electron');
const dictParser = require('../../src/parsers/parser');
const { imes } = require('../../src/parsers/extensions');
const log = require('electron-log');

ipcMain.on('event-error-in-process', function (event, data) {
    log.error('error in process:%s', data);
});

ipcMain.on('event-import-dict-dialog', (event) => {
    var options = {
        properties: ['openFile', 'multiSelections'],
        filters: [
            {
                name: '词库文件',
                extensions: Object.keys(imes)
            }
        ]
    };

    dialog.showOpenDialog(options).then(function (result) {
        if (result.canceled) {
            event.sender.send('event-dict-parse-canceled');
            return;
        }

        event.sender.send('event-dict-parse-will-begin');

        Array.prototype.forEach.call(result['filePaths'], (filePath) => {
            dictParser.parse(filePath, (dict) => {
                event.sender.send('event-dict-parse-completed', dict);
            });
        });
    }).catch(ex => {
        event.sender.send('event-dict-parse-error');
    });
});
