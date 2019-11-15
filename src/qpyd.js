const fs = require('fs')
const zip = require('zlib')
const BufferReader = require('./buffer-reader')
const log = require('electron-log')

class QQ_V1 {
  parseBuffer(buf) {
    const reader = new BufferReader(buf)
    const header = reader.nextBuffer(4).toString('hex')
    if (header != '09a61e7d') {
      log.error('无效的QQ词库，文件头无效：' + header)
      throw new Error('无效的QQ词库')
    }

    reader.moveTo(0x38)
    const startAt = reader.nextInt32LE()
    reader.moveTo(0x44)
    const wordCount = reader.nextInt32LE()
    log.debug('Start:%d count:%d', startAt, wordCount)

    reader.moveTo(0x60)
    const infos = reader.nextString(startAt - 0x60).split("\r\n")
    const title = infos.find(info => info.indexOf('Name:') > -1).split(': ')[1]
    const category = infos.find(info => info.indexOf('Type:') > -1).split(': ')[1]
    const description = infos.find(info => info.indexOf('Intro:') > -1).split(': ')[1]
    const examples = infos.find(info => info.indexOf('Example:') > -1).split(': ')[1]
    const words = this.parseWords(reader, startAt, wordCount)

    return {
      title: title,
      category: category,
      description: description,
      words: words
    }
  }

  parseWords(reader, startAt, wordCount) {
    reader.moveTo(startAt)
    zip.deflate(reader.toEnd(), (err, buffer) => {
      if (err) {
        log.err('Unzip error, %s', err)
      } else {
        const unzipReader = new BufferReader(buffer)
        this.parseUnzip(unzipReader)
      }
    })
  }

  parseUnzip(unzipReader, wordCount) {
    const words = []
    for (var i = 0; i < wordCount; i++) {
      const wordsLength = reader.nextInt16LE()
      const pinyinLength = reader.nextInt16LE()
      log.debug('Q:%d %d', wordsLength, pinyinLength)
      const pinyin = [...Array(pinyinLength / 2)].map(() => reader.nextInt16LE()).join(' ')
      for (var i = 0; i < wordsLength; i++) {
        const wordBytes = reader.nextInt16LE()
        const word = reader.nextString(wordBytes)
        const extBytes = reader.nextInt16LE()
        const ext = reader.nextBuffer(extBytes)
        words.push({ word, pinyin })
        log.debug('Q:%s %s', word, pinyin)
      }
    }
    return words
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

module.exports = QQ_V1