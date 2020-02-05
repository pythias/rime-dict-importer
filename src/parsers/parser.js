const fs = require('fs');
const { imes } = require('./extensions');
const log = require('electron-log');

class dictParser {
  static parse(filePath, extension) {
    const parser = new imes[extension].parser();

    return parser.parseFile(filePath);
  }
}

module.exports = dictParser;