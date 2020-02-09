const { ipcRenderer } = require('electron');
const { imes } = require('../../src/parsers/extensions');
const importButton = document.getElementById("button-dicts-import");

function convertBegin() {
    importButton.innerHTML = "正在解析";
    importButton.disabled = true;
}

function convertEnd() {
    importButton.innerHTML = "添加词库";
    importButton.disabled = false;
}

importButton.addEventListener('click', (event) => {
    importButton.disabled = true;
    ipcRenderer.send('event-import-dict-dialog');
})

window.onerror = function (error, url, line) {
    ipcRenderer.send('event-error-in-process', error);
};

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
    const table = document.getElementById("dict-table");
    table.hidden = false;
    
    var tableRef = table.getElementsByTagName('tbody')[0];
    var row = tableRef.insertRow();
    row.dataset.dict_id = dict.id;

    var cell = row.insertCell();
    cell.innerHTML = dict.title;
    var cell = row.insertCell();
    cell.innerHTML = dict.category;
    var cell = row.insertCell();
    cell.innerHTML = dict.source;
    var cell = row.insertCell();
    cell.innerHTML = dict.count;

    convertEnd();
});
