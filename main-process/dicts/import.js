const { ipcMain, dialog } = require('electron');
const dictParser = require('../../src/parser');
const { imes } = require('../../src/extensions');
const md5 = require('md5');
const log = require('electron-log');
const path = require('path');

ipcMain.on('event-error-in-process', function(event, data){
    log.error(data);
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

  dialog.showOpenDialog(options).then(function(result) {
    if (result.canceled) {
      event.sender.send('event-dict-parse-canceled');
      return;
    }

    Array.prototype.forEach.call(result['filePaths'], (filePath) => {
      const extension = filePath.split('.').pop().toLowerCase();
      dictParser.parse(filePath, extension).then((result) => {
        const dict = {
          id: md5(result.title + "-" + extension),
          title: result.title,
          description: result.description,
          category: result.category,
          words: result.words,
          count: result.words.length,
          extension: extension,
          last_updated: (new Date()).toDateString()
        };

        event.sender.send('event-dict-parse-completed', dict);
      });
    });
  }).catch(ex => {
    event.sender.send('event-dict-parse-error');
    log.error(ex);
  });
});
