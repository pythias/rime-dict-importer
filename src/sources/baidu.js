const request = require('request');
const cheerio = require('cheerio');

class baiduLoader {
    static getCategoryIdFromUrl(url) {
        return parseInt(url.match(/([0-9]+)$/g)[0]);
    }

    static getByCategory(category, page = 1) {
        return new Promise((resolve, reject) => {
            const url = 'https://shurufa.baidu.com/dict_list?cid=' + category + '&page=' + page;
            request.get({url: url}, (err, response, body) => {
                if (err) {
                    return reject(err);
                }

                let dicts = [];
                const $ = cheerio.load(body);
                $('.dict-list-info > table > tbody > tr').each((index, element) => {
                    try {
                        const tds = $(element).find('td');
                        const title = $(tds[0]).text();
                        const examples = $(tds[1]).text();
                        const downloads = $(tds[2]).text();
                        const updatedAt = $(tds[3]).text();
                        const id = $(tds[4]).find('a').attr('dict-innerid');
                        const url = 'https://shurufa.baidu.com/dict_innerid_download?innerid=' + id;
                        dicts.push({
                            id: id,
                            url: url,
                            title: title,
                            examples: examples,
                            downloads: downloads,
                            updatedAt: updatedAt,
                        });
                    } catch (error) {
                        console.error(error);
                    }
                });

                const lastPage = $('.pages > .last');
                if (lastPage) {
                    const count = parseInt(lastPage.prev().text());
                    resolve({
                        page: page,
                        count: count,
                        dicts: dicts,
                    });
                } else {
                    resolve({
                        page: page,
                        count: 1,
                        dicts: dicts,
                    });
                }
            });
        });
    }
}

module.exports = baiduLoader;