require('es6-promise').polyfill();
require('isomorphic-fetch');

const tableName = require('../db/config').tableName;

const map_key_test = '26f843db0f8f4ba4e2a5d6e69671ee6a';

// https://lbs.amap.com/api/webservice/guide/api/district/

// https://restapi.amap.com/v3/config/district?keywords=北京&subdistrict=2&key=<用户的key>

const getUrl = (name, subdistrict = 3) => {
    return `https://restapi.amap.com/v3/config/district?keywords=${name}&subdistrict=${subdistrict}&key=${map_key_test}`
}

const options = {
    "method": 'get',
    "Content-Type": 'application/json',
    "referer": "https://detail.tmall.com/item.htm",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
};

const getSql = (obj) => {
    return `insert into ${tableName} values (null,'${obj.name}','${obj.citycode}','${obj.adcode}','${obj.center}','${obj.level}');`
}

function queryDistrict(name, subdistrict) {
    let url = getUrl(name, subdistrict);
    console.log(url)
    url = encodeURI(url);
    return new Promise((resolve, reject) => {
        fetch(url, options).then(response => {
            if (response.headers.get('content-type').match(/application\/json/)) {
                return response.json();
            }
            return [];
        }).then(json => {
            if (json.status === '1' && json.districts && json.districts[0]) {
                // console.log(JSON.stringify(json.districts))
                // city array
                return resolve(json.districts[0]['districts']);
            }
            return reject(json);

        }).catch(err => {
            console.log('接口请求异常');
            return reject(err);
        });
    });
}


/* 获取省sql */
function provinceDataHandler(provinces) {
    let provincesql = [];
    let provinceNames = [];
    for (const province of provinces) {
        // 省
        const sql = getSql(province);
        provincesql.push(sql);
        provinceNames.push(province.name);
    }
    // console.log(provinceNames);
    // console.log(provincesql.length);

    return {
        provinceNames,
        provincesql,
    };
}

/* 获取街道sql */
function streetDataHandler(citys) {
    let streetsql = [];
    for (const city of citys) {
        // 区、县
        const districts = city.districts;
        for (const dist of districts) {
            // 街道
            for (const street of dist.districts) {
                const sql = getSql(street);
                streetsql.push(sql);
            }
        }
    }
    // console.log(streetsql);
    return streetsql;
}

/* 省名称 */
function qryProvinceNames() {
    return new Promise((resolve, reject) => {
        queryDistrict('中华人民共和国', 1).then(json => {
            const result = provinceDataHandler(json);
            return resolve(result['provinceNames']);
        }).catch(e => reject(e));
    });
}

/* 省 */
function crawlerProvinceData() {
    return new Promise((resolve, reject) => {
        queryDistrict('中华人民共和国', 1).then(json => {
            const result = provinceDataHandler(json);
            return resolve(result['provincesql']);
        }).catch(e => reject(e));
    });
}

/* 全国的街道级别数据 */
function crawlerStreetData() {
    let promiseAll = [], streetsql = [];
    return new Promise((resolve, reject) => {
        qryProvinceNames().then(provinceNames => {
            console.log(provinceNames)
            // provinceNames=['广东省','台湾省','香港特别行政区']
            for (let name of provinceNames) {
                promiseAll.push(queryDistrict(name))
            }
            Promise.all(promiseAll).then(result => {
                for (let dists of result) {
                    let sql = streetDataHandler(dists);
                    // console.log(sql.length)
                    streetsql = streetsql.concat(sql);
                }
                return resolve(streetsql);
            }).catch(e => {
                console.log(e);
                return reject(e);
            })
        });
    });
}
/* 市 */
function crawlerCityData() {
    let citysql = [];
    return new Promise((resolve, reject) => {
        queryDistrict('中华人民共和国', 2).then(result => {
            for (let province of result) {
                for (let city of province.districts) {
                    const sql = getSql(city);
                    citysql.push(sql);
                }
            }
            return resolve(citysql);
        }).catch(e => reject(e));
    })
}
/* 区县 */
function crawlerDistrictData() {
    let distsql = [];
    return new Promise((resolve, reject) => {
        queryDistrict('中华人民共和国', 3).then(result => {
            for (let province of result) {
                for (let city of province.districts) {
                    for (let dist of city.districts) {
                        const sql = getSql(dist);
                        distsql.push(sql);
                    }
                }
            }
            return resolve(distsql);
        }).catch(e => reject(e));
    })
}

// crawlerDistrictData().then(json => console.log(json));

module.exports = {
    qryProvinceNames,
    crawlerProvinceData,
    crawlerCityData,
    crawlerDistrictData,
    crawlerStreetData,
}