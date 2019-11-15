const fs = require('fs');
const BufferReader = require('./buffer-reader');
const log = require('electron-log');
const SHENGMU = ["c", "d", "b", "f", "g", "h", "ch", "j", "k", "l", "m", "n", "", "p", "q", "r", "s", "t", "sh", "zh", "w", "x", "y", "z"];
const YUNMU = ["uang", "iang", "ong", "ang", "eng", "ian", "iao", "ing", "ong", "uai", "uan", "ai", "an", "ao", "ei","en", "er", "ua", "ie", "in", "iu", "ou", "ia", "ue", "ui", "un", "uo", "a", "e", "i", "a", "u", "v"];

class BAIDU {
  parseBuffer(buf) {
    const reader = new BufferReader(buf);
    const header = reader.nextBuffer(4).toString('hex');
    if (header != '62697074') {
      log.error('无效的百度词库，文件头无效：' + header);
      throw new Error('无效的百度词库');
    }

    reader.moveTo(0x90);
    const title = reader.nextTrimString(0xD0 - 0x090);
    const author = reader.nextTrimString(0x110 - 0xD0);
    const category = reader.nextTrimString(0x150 - 0x110);
    const description = reader.nextTrimString(0x350 - 0x150);
    const words = this.parseWords(reader);

    return {
      title: title,
      category: category,
      description: description,
      words: words
    };
  }

  parseWords(reader) {
    const words = [];
    while (!reader.end()) {
      const length = reader.nextInt32LE();
      if (length == 0) {
        this.parseSpecialWord(reader);
        continue;
      }
      if (length > 1000) {
        log.error('Unknown format found at %d', reader.getPostion());
        break;
      }
      
      const pinyin = [...Array(length)].map(() => SHENGMU[reader.nextInt8()] + YUNMU[reader.nextInt8()]).join(' ');
      const word = reader.nextString(length * 2);
      words.push({ word, pinyin });
    }

    return words;
  }

  parseSpecialWord(reader) {
    const pinyinLength = reader.nextInt16LE();
    const wordLength = reader.nextInt16LE();
    const pinyin = reader.nextString(pinyinLength * 2);
    const word = reader.nextString(wordLength * 2);
    log.debug('Special word "%s/%s" found at %d', word, pinyin, reader.getPostion());
  }

  parseFile(path) {
    return new Promise(resolve => {
      fs.readFile(path, (err, data) => {
        if (err) {
          throw err;
        }

        resolve(this.parseBuffer(data));
      });
    });
  }
}

module.exports = BAIDU;