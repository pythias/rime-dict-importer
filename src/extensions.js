const SOGOU = require('./sogou');
const BAIDU = require('./baidu');
const QQ_V0 = require('./qcel');
const QQ_V1 = require('./qpyd');

const imes = {
    bdict : {
        name: '百度', 
        parser: BAIDU
    }, 
    qcel : {
        name: '腾讯', 
        parser: QQ_V0
    },  
    qpyd : {
        name: '腾讯', 
        parser: QQ_V1
    }, 
    scel : {
        name: '搜狗', 
        parser:SOGOU
    }
};

module.exports = { 
    imes: imes
};