const { ipcRenderer } = require('electron');
const buttonSet = document.getElementById('button-tools-set');
const log = require('electron-log');
const { imes } = require('../../src/parsers/extensions');

const STATUS_USED = '已使用';
const STATUS_NEW = '新導入';
const STATUS_UPDATED = '更新';
const STATUS_CLOSED = '待启用';

var dicts = {};

ipcRenderer.send("event-tools-rime-preload");

buttonSet.addEventListener("click", (e) => {
    var tableRef = document.getElementById("dict-rime-table").getElementsByTagName('tbody')[0];
    Array.prototype.forEach.call(tableRef.rows, (row) => {
        if (row.cells[0].children[0].checked) {
            const status = row.cells[5].innerHTML;
            if (status == STATUS_NEW) {
                ipcRenderer.send("event-tools-rime-new-dict", dicts[row.id]);
            } else if (status == STATUS_UPDATED) {
                ipcRenderer.send("event-tools-rime-update-dict", dicts[row.id]);
            } else if (status == STATUS_CLOSED) {
                ipcRenderer.send("event-tools-rime-open-dict", dicts[row.id]);
            }
        } else {
            ipcRenderer.send("event-tools-rime-remove-dict", dicts[row.id]);
        }
    });

    ipcRenderer.send("event-tools-rime-set-completed");
});

ipcRenderer.on("event-tools-rime-loaded", (e) => {
    buttonSet.disabled = false;
    buttonSet.innerHTML = "设定";
});

ipcRenderer.on('event-dict-parse-completed', (event, dict) => {
    insertDict(dict, true);
});

ipcRenderer.on('event-dict-load-completed', (event, dict) => {
    insertDict(dict, false);
});

function insertDict(dict, new_imported) {
    var tableRef = document.getElementById("dict-rime-table").getElementsByTagName('tbody')[0];

    if (tableRef.rows) {
        var exists = false;
        Array.prototype.forEach.call(tableRef.rows, (row) => {
            if (row.id == dict.id) {
                exists = true;

                if (old == false) {
                    row.cells[2].innerHTML = dict.category;
                    row.cells[3].innerHTML = dict.source;
                    row.cells[4].innerHTML = dict.count;
                    dicts[dict.id] = dict;
                }

                row.cells[5].innerHTML = STATUS_UPDATED;
                return;
            }
        });

        if (exists) {
            return;
        }
    }

    dicts[dict.id] = dict;

    var row = tableRef.insertRow();
    row.id = dict.id;

    var cell = row.insertCell();
    cell.innerHTML = "<input type=\"checkbox\"" + (dict.checked ? "checked" : "") + " name=\"dicts-selected\" value=\"" + dict.id + "\">";
    var cell = row.insertCell();
    cell.innerHTML = dict.title;
    var cell = row.insertCell();
    cell.innerHTML = dict.category;
    var cell = row.insertCell();
    cell.innerHTML = dict.source;
    var cell = row.insertCell();
    cell.innerHTML = dict.count;
    var cell = row.insertCell();
    cell.innerHTML = new_imported ? STATUS_NEW : (dict.checked ? STATUS_USED : STATUS_CLOSED);
}
