const sogouLoader = require('./sogou');
const baiduLoader = require('./baidu');

const loaders = {
    baidu: baiduLoader,
    sogou: sogouLoader,
}

const loaderCategories = {
    baidu: {
        '157': '城市区划',
        '158': '理工行业',
        '317': '人文社会',
        '162': '电子游戏',
        '159': '生活百科',
        '163': '娱乐休闲',
        '165': '人名专区',
        '160': '文化艺术',
        '161': '体育运动',
    },
    sogou: {
        '167': '城市信息',
        '1': '自然科学',
        '76': '社会科学',
        '96': '工程应用',
        '127': '农林鱼畜',
        '132': '医学医药',
        '436': '电子游戏',
        '154': '艺术设计',
        '389': '生活百科',
        '367': '运动休闲',
        '31': '人文科学',
        '403': '娱乐休闲',
    },
    qq: {
        hasSubCategory: true,
        categories: {
            "人文社科": {
                title: "人文社科",
                subCategories: {
                    "人文": "人文",
                    "社会": "社会",
                    "艺术": "艺术",
                    "教育": "教育",
                    "经济": "经济",
                    "军事": "军事",
                },
            },
            "电子游戏": {
                title: "电子游戏",
                subCategories: {
                    "网络游戏": "网络游戏",
                    "单机游戏": "单机游戏",
                    "网页游戏": "网页游戏",
                },
            },
            "城市地区": {
                title: "城市地区",
                subCategories: {
                    "广东": "广东",
                    "山东": "山东",
                    "四川": "四川",
                    "湖北": "湖北",
                    "江苏": "江苏",
                    "河南": "河南",
                    "湖南": "湖南",
                    "浙江": "浙江",
                    "河北": "河北",
                    "安徽": "安徽",
                    "江西": "江西",
                    "广西": "广西",
                    "云南": "云南",
                    "福建": "福建",
                    "辽宁": "辽宁",
                    "内蒙古": "内蒙古",
                    "陕西": "陕西",
                    "甘肃": "甘肃",
                    "山西": "山西",
                    "贵州": "贵州",
                    "黑龙江": "黑龙江",
                    "新疆": "新疆",
                    "其它": "其它",
                    "吉林": "吉林",
                    "海南": "海南",
                    "重庆": "重庆",
                    "西藏": "西藏",
                    "宁夏": "宁夏",
                    "青海": "青海",
                    "上海": "上海",
                    "国外地名": "国外地名",
                    "台湾": "台湾",
                    "北京": "北京",
                    "天津": "天津",
                    "香港": "香港",
                    "澳门": "澳门",
                },
            },
            "休闲娱乐": {
                title: "休闲娱乐",
                subCategories: {
                    "其它": "其它",
                    "动漫": "动漫",
                    "影视": "影视",
                    "音乐": "音乐",
                    "棋牌": "棋牌",
                },
            },
            "理工农医": {
                title: "理工农医",
                subCategories: {
                    "理学": "理学",
                    "工学": "工学",
                    "医学": "医学",
                    "农学": "农学",
                },
            },
            "兴趣爱好": {
                title: "兴趣爱好",
                subCategories: {
                    "其它": "其它",
                    "美食": "美食",
                    "旅游": "旅游",
                    "宠物": "宠物",
                    "日常": "日常",
                    "汽车": "汽车",
                    "园艺": "园艺",
                    "房产": "房产",
                },
            },
            "体育运动": {
                title: "体育运动",
                subCategories: {
                    "球类": "球类",
                    "运动健身": "运动健身",
                },
            },
            "功能": {
                title: "功能",
                subCategories: {
                    "错音提示": "错音提示",
                },
            },
        },
    },
}

class dictLoader {
    static load(source, category, page, callback) {
        loaders[source].getByCategory(category, page).then((result) => {
            callback(result);
        });
    }
}

module.exports = { dictLoader, loaderCategories };