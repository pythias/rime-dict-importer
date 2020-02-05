const SOGOU = require('./sogou');
const BAIDU = require('./baidu');
const QQ_V0 = require('./qcel');
const QQ_V1 = require('./qpyd');

const imes = {
    bdict : {
        title: '百度', 
        parser: BAIDU,
        name: 'baidu',
    }, 
    qcel : {
        title: '腾讯', 
        parser: QQ_V0,
        name: 'qq',
    },  
    qpyd : {
        title: '腾讯', 
        parser: QQ_V1,
        name: 'qq',
    }, 
    scel : {
        title: '搜狗', 
        parser:SOGOU,
        name: 'sogou',
    }
};

module.exports = { imes };