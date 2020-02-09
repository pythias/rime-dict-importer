const request = require('request');
const cheerio = require('cheerio');

class sogouLoader {
    static getCategoryIdFromUrl(url) {
        return parseInt(url.match(/([0-9]+)$/g)[0]);
    }

    static getByCategory(category, page = 1) {
        return new Promise((resolve, reject) => {
            const url = 'https://pinyin.sogou.com/dict/cate/index/' + category + '/default/' + page;
            request.get({url: url}, (err, response, body) => {
                if (err) {
                    return reject(err);
                }

                let dicts = [];
                const $ = cheerio.load(body);

                $('.dict_detail_block').each((index, element) => {
                    try {
                        const a = $(element).find('.detail_title').find('a');
                        const id = this.getCategoryIdFromUrl(a.attr('href'));
                        const title = a.text();
                        const url = $(element).find('.dict_dl_btn').find('a').attr('href');

                        const contents = $(element).find('.show_content');
                        const examples = $(contents[0]).text();
                        const downloads = $(contents[1]).text();
                        const updatedAt = $(contents[2]).text();
                        dicts.push({
                            id: id,
                            url: url,
                            title: title,
                            examples: examples,
                            downloads: downloads,
                            updatedAt: updatedAt,
                        });
                    } catch (error) {
                        log.error('Sogou, invalid format, %s', error);
                    }
                });

                const pages = $('#dict_page_list > ul > li > span > a');
                if (pages) {
                    var count = parseInt($(pages[pages.length - 1]).text());
                    if (!count) {
                        count = parseInt($(pages[pages.length - 2]).text());
                    }
                    
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

module.exports = sogouLoader