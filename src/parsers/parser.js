const fs = require('fs');
const { imes } = require('./extensions');
const log = require('electron-log');
const md5 = require('md5');

class dictParser {
    static parse(filePath, callback) {
        const extension = filePath.split('.').pop().toLowerCase();
        const parser = new imes[extension].parser();
        parser.parseFile(filePath).then((dict) => {
            console.log(dict);
            dict.id = ('duo.' + dict.name + '.' + md5(dict.title)).replace(/,/ig, "");
            dict.count = dict.words.length;
            callback(dict);
        });
    }
}

module.exports = dictParser;