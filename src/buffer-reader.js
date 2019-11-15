class BufferReader {
  constructor(buf) {
    this.buf = buf;
    this.pos = 0;
  }

  moveTo(pos) {
    this.pos = pos;
  }

  getPostion() {
    return this.pos;
  }

  nextInt8() {
    const num = this.buf.readInt8(this.pos);
    this.pos += 1;
    return num;
  }

  nextInt16LE() {
    const num = this.buf.readInt16LE(this.pos);
    this.pos += 2;
    return num;
  }

  nextInt32LE() {
    const num = this.buf.readInt32LE(this.pos);
    this.pos += 4;
    return num;
  }

  nextString(length) {
    const str = this.buf.slice(this.pos, this.pos + length).toString('utf16le');
    this.pos += length;
    return str;
  }

  nextTrimString(length) {
    const str = this.buf.slice(this.pos, this.pos + length).toString('utf16le').split('\x00', 1)[0];
    this.pos += length;
    return str;
  }

  nextBuffer(length) {
    const buf = this.buf.slice(this.pos, this.pos + length);
    this.pos += length;
    return buf;
  }

  toEnd() {
    //this.pos = this.buf.length
    return this.buf.slice(this.pos);
  }

  end() {
    return this.pos >= this.buf.length;
  }
}

module.exports = BufferReader;