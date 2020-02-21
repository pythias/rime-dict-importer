const { ipcRenderer } = require('electron');
const selectSource = document.getElementById('select-source');
const selectCategogry = document.getElementById('select-category');
const tablePageDicts = document.getElementById("table-page-dicts");
const tableBody = tablePageDicts.getElementsByTagName('tbody')[0];
const spanStatus = document.getElementById('loader-status');
const divPages = document.getElementById('pages-list');
const log = require('electron-log');
const dictParser = require('../../src/parsers/parser');
const { dictLoader, loaderCategories } = require('../../src/sources/loader');

var sourceValue = 'sogou';
var categoryValue = '';

document.body.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() === 'button') {
        if (event.target.disabled) {
            return;
        }

        const type = event.target.dataset.type;
        switch (type) {
            case 'loader-page':
                loadDicts(sourceValue, categoryValue, parseInt(event.target.dataset.page));
                break;
            case 'loader-download':
                event.target.disabled = true;
                event.target.textContent = "正在下载";
                ipcRenderer.send('event-dict-download-begin', {id: event.target.dataset.id, url: event.target.dataset.url});
                break;
            default:
                break;
        }
    }
});

ipcRenderer.on('event-dict-download-completed', (event, dict) => {
    var button = document.getElementById('button_download_' + dict.id);
    button.textContent = "正在解析";
    dictParser.parse(dict.path, (dict) => {
        button.textContent = "解析完成";
        event.sender.send('event-dict-parse-completed', dict);
    });
});

selectSource.addEventListener('change', (e) => {
    sourceValue = e.target.value;
    
    clearNode(selectCategogry);

    selectCategogry.insertAdjacentHTML('beforeend', '<option value="">--请选择--</option>');
    for (const key in loaderCategories[sourceValue]) {
        const value = loaderCategories[sourceValue][key];
        selectCategogry.insertAdjacentHTML('beforeend', '<option value="' + key + '">' + value + '</option>');
    }
});

function clearNode(node) {
    for (let index = node.childNodes.length - 1; index >= 0; index--) {
        node.childNodes[index].remove();
    }
}

function initPages(container, info) {
    clearNode(container);

    if (info.count == 1) {
        container.hidden = true;
        return;
    }

    container.hidden = false;

    if (info.count == 2) {
        if (info.page == 1) {
            container.insertAdjacentHTML('beforeend', '<button disabled data-type="loader-page" data-page="1">1</button>');
            container.insertAdjacentHTML('beforeend', '<button data-type="loader-page" data-page="2">2</button>');
        } else {
            container.insertAdjacentHTML('beforeend', '<button data-type="loader-page" data-page="1">1</button>');
            container.insertAdjacentHTML('beforeend', '<button disabled data-type="loader-page" data-page="2">2</button>');
        }
        
        return;
    }

    container.insertAdjacentHTML('beforeend', '<button' + (info.page == 1 ? ' disabled' : '') + ' class="small-button" data-type="loader-page" data-page="' + (info.page - 1) + '">上一页</button>');
    
    //P1
    if (info.page >= 5) {
        container.insertAdjacentHTML('beforeend', '<button class="small-button" data-type="loader-page" data-page="1">1</button>');
        if (info.page != 5) {
            container.insertAdjacentHTML('beforeend', '<span>...</span>');
        }
    }

    //P2
    for (let i = info.page - 3; i < info.page + 4; i++) {
        if (i < 1 || i > info.count) {
            continue;
        }

        container.insertAdjacentHTML('beforeend', '<button' + (info.page == i ? ' disabled' : '') + ' class="small-button" data-type="loader-page" data-page="' + i + '">' + i + '</button>');
    }

    //P3
    if (info.page <= (info.count - 4)) {
        if (info.page != (info.count - 4)) {
            container.insertAdjacentHTML('beforeend', '<span>...</span>');
        }
        container.insertAdjacentHTML('beforeend', '<button class="small-button" data-type="loader-page" data-page="' + info.count + '">' + info.count + '</button>');
    }

    container.insertAdjacentHTML('beforeend', '<button' + (info.page == info.count ? ' disabled' : '') + ' class="small-button" data-type="loader-page" data-page="' + (info.page + 1) + '">下一页</button>');
}

function resetTable(table) {
    if (table.rows) {
        for (let index = table.rows.length - 1; index >= 0; index--) {
            table.rows[index].remove();
        }
    }
}

function insertDict(table, dict) {
    var row = table.insertRow();
    var cell = row.insertCell();
    cell.innerHTML = dict.title;
    var cell = row.insertCell();
    cell.innerHTML = dict.examples.substr(0, 8) + '...';
    var cell = row.insertCell();
    cell.innerHTML = dict.downloads;
    var cell = row.insertCell();
    cell.innerHTML = dict.updatedAt;
    var cell = row.insertCell();
    cell.innerHTML = '<button class="small-button" style="width:90px;" id="button_download_' + dict.id + '" data-type="loader-download" data-id="' + dict.id + '" data-url="' + dict.url + '">下载</button>';
}

function loadDicts(source, category, page) {
    spanStatus.textContent = "正在加载词库列表...";
    dictLoader.load(source, category, page, (info) => {
        spanStatus.textContent = "加载已完成";

        if (!info.dicts) {
            return;
        }
        
        tablePageDicts.hidden = false;

        resetTable(tableBody);
        info.dicts.forEach(dict => {
            insertDict(tableBody, dict);
        });
        initPages(divPages, info);
    });
}

selectCategogry.addEventListener('change', (e) => {
    categoryValue = e.target.value;
    if (categoryValue == "") {
        return;
    }

    loadDicts(sourceValue, categoryValue, 1);
});

