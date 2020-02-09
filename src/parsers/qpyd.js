const fs = require('fs');
const zip = require('zlib');
const BufferReader = require('./buffer-reader');
const log = require('electron-log');

class QQ_V1 {
  parseBuffer(buf) {
    const reader = new BufferReader(buf);
    const header = reader.nextBuffer(4).toString('hex');
    if (header != '09a61e7d') {
      log.error('无效的QQ词库，文件头无效：' + header);
      throw new Error('无效的QQ词库');
    }

    reader.moveTo(0x38);
    const startAt = reader.nextInt32LE();
    reader.moveTo(0x44);
    const wordCount = reader.nextInt32LE();
    reader.moveTo(0x60);
    const infos = reader.nextString(startAt - 0x60).split("\r\n");
    const title = infos.find(info => info.indexOf('Name:') > -1).split(': ')[1];
    const category = infos.find(info => info.indexOf('Type:') > -1).split(': ')[1];
    const description = infos.find(info => info.indexOf('Intro:') > -1).split(': ')[1];
    const examples = infos.find(info => info.indexOf('Example:') > -1).split(': ')[1];
    const words = this.parseWords(reader, startAt, wordCount);

    return {
      name: 'qq',
      title: title,
      source: '腾讯词库',
      category: category,
      description: description,
      words: words
    };
  }

  parseWords(reader, startAt, wordCount) {
    reader.moveTo(startAt);
    const zippedBytes = reader.toEnd();
    const buffer = zip.inflateSync(zippedBytes);
    const unzipReader = new BufferReader(buffer);
    const words = this.parseUnzip(unzipReader, wordCount);
    return words;
  }

  parseUnzip(reader, wordCount) {
    const words = [];
    try {
      for (var i = 0; i < wordCount; i++) {
        const pinyinLength = reader.nextInt8() & 0xff;
        const wordLength = reader.nextInt8() & 0xff;
        reader.nextInt32LE();
        const pinyinStart = reader.nextInt32LE();
        const wordStart = pinyinStart + pinyinLength;
        const current = reader.getPostion();
        
        reader.moveTo(pinyinStart);
        let pinyin = reader.nextStringUtf8(pinyinLength);
        pinyin = pinyin.replace(/'/gi, " ")
        reader.moveTo(wordStart);
        const word = reader.nextString(wordLength);
        reader.moveTo(current);
        words.push({ word, pinyin });
      }
    } catch (error) {
      log.error('QQ, invalid format, %s', error);
    }
    
    return words;
  }

  parseFile(path) {
    return new Promise(resolve => {
      fs.readFile(path, (err, data) => {
        if (err) {
          throw err;
        }

        resolve(this.parseBuffer(data));
      })
    })
  }
}

module.exports = QQ_V1