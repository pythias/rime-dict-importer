const fs = require('fs')
const BufferReader = require('./buffer-reader')
const log = require('electron-log')

class SOGOU {
  parseBuffer(buf) {
    const reader = new BufferReader(buf)
    const header = reader.nextBuffer(4).toString('hex')
    if (header != '40150000') {
      log.error('无效的搜狗词库，文件头无效：' + header)
      throw new Error('无效的搜狗词库')
    }

    const flag = reader.nextBuffer(4).toString('hex')
    var pinyinEndPosition = 0
    if (flag == '44435301') {
      pinyinEndPosition = 0x2628
    } else if (flag == '45435301') {
      pinyinEndPosition = 0x26C4
    } else {
      log.error('无效的搜狗词库，FLAG头无效：' + flag)
      throw new Error('无效的搜狗词库')
    }

    reader.moveTo(0x130)
    const title = reader.nextTrimString(0x338 - 0x130)
    const category = reader.nextTrimString(0x540 - 0x338)
    const description = reader.nextTrimString(0xd40 - 0x540)

    const pinyinTable = this.parsePinyin(reader, pinyinEndPosition)
    const words = this.parseWords(reader, pinyinTable)

    return {
      title: title,
      category: category,
      description: description,
      words: words
    }
  }

  parsePinyin(reader, endPosition) {
    reader.moveTo(0x1540)
    const table = {}
    while (reader.getPostion() < endPosition) {
      const index = reader.nextInt16LE()
      const len = reader.nextInt16LE()
      table[index] = reader.nextString(len)
    }
    return table
  }

  parseWords(reader, pinyinTable) {
    const words = []
    while (!reader.end()) {
      const wordsLength = reader.nextInt16LE()
      const pinyinLength = reader.nextInt16LE()
      const pinyin = [...Array(pinyinLength / 2)].map(() => pinyinTable[reader.nextInt16LE()]).join(' ')
      for (var i = 0; i < wordsLength; i++) {
        const wordBytes = reader.nextInt16LE()
        const word = reader.nextString(wordBytes)
        const extBytes = reader.nextInt16LE()
        const ext = reader.nextBuffer(extBytes)
        words.push({ word, pinyin })
      }
    }

    return words;
  }

  parseFile(path) {
    return new Promise(resolve => {
      fs.readFile(path, (err, data) => {
        if (err) {
          throw err
        }

        resolve(this.parseBuffer(data))
      })
    })
  }
}

module.exports = SOGOU