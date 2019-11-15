const { ipcRenderer } = require('electron');
const importDictButton = document.getElementById('button-dicts-import');
const settings = require('electron-settings');
const importButton = document.getElementById('button-dicts-import');
const { imes } = require('../../src/extensions');

function convertBegin() {
  importButton.innerHTML = "正在解析";
  importButton.disabled = true;
}

function convertEnd() {
  importButton.innerHTML = "添加词库";
  importButton.disabled = false;
}

window.onerror = function(error, url, line) {
    ipcRenderer.send('event-error-in-process', error);
};

importDictButton.addEventListener('click', (event) => {
  ipcRenderer.send('event-import-dict-dialog');
})

ipcRenderer.on('event-dict-parse-will-begin', (event) => {
  convertBegin();
})

ipcRenderer.on('event-dict-parse-canceled', (event) => {
  convertEnd();
})

ipcRenderer.on('event-dict-parse-error', (event) => {
  convertEnd();
})

ipcRenderer.on('event-dict-parse-completed', (event, dict) => {
  var tableRef = document.getElementById("dict-table").getElementsByTagName('tbody')[0];
  var row = tableRef.insertRow();
  row.dataset.dict_id = dict.id;

  var cell0 = row.insertCell(0);
  var cell1 = row.insertCell(1);
  var cell2 = row.insertCell(2);
  var cell3 = row.insertCell(3);
  var cell4 = row.insertCell(4);
  cell0.innerHTML = "<input type=\"checkbox\" name=\"dicts-selected\" value=\"" + dict.id + "\">";
  cell1.innerHTML = dict.title;
  cell2.innerHTML = dict.category;
  cell3.innerHTML = imes[dict.extension].name;
  cell4.innerHTML = dict.count;

  convertEnd();
})

