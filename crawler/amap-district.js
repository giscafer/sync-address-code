require('es6-promise').polyfill();
require('isomorphic-fetch');
const fs = require('fs');
const tableName = require('../db/config').tableName;
const _ = require('lodash');
const duplicates = require('./duplicates');

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
const level = {
    'province': 0,
    'city': 1,
    'district': 2,
    'street': 3,
};
// 12位code
const genCodeId = (adcode) => {
    return adcode + Array((12 - adcode.length)).fill('x').join('');
}
/**
 * 
 * @param {*} obj 政区数据
 * @param {*} parentName 父级mergeName
 * @param {*} id 当前id
 * @param {*} parentId 父级id
 */
const getSql = (obj, parentName, id, parentId) => {
    let lonlat = obj.center.split(',');
    const mergerName = parentName ? `${parentName}/${obj.name}` : obj.name;

    const code = obj.adcode + Array((12 - obj.adcode.length)).fill('0').join('');

    return `insert into ${tableName} values ('${id}',now(),1,now(),2,'${code}',${lonlat[1] || 0},${level[obj.level]},${lonlat[0] || 0},'${mergerName}','${obj.name}','','','+86','${obj.citycode}','${parentId}');`
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
    provinces.forEach((province, index) => {
        let id = genCodeId(province.adcode);
        const sql = getSql(province, '', id, '000000000000');
        provincesql.push(sql);
        provinceNames.push(province.name);
    })
    // console.log(provinceNames);
    // console.log(provincesql.length);

    return {
        provinceNames,
        provincesql,
    };
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
            for (let name of provinceNames) {
                promiseAll.push(queryDistrict(name))
            }
            Promise.all(promiseAll).then(result => {

                result.forEach((item, index) => {
                    let provinceName = provinceNames[index];
                    let sql = streetDataHandler(item, provinceName);
                    streetsql = streetsql.concat(sql);
                })
                return resolve(streetsql);
            }).catch(e => {
                console.log(e);
                return reject(e);
            })
        });
    });
}
/* 获取街道sql */
//发现街道的code和县区一模一样的
function streetDataHandler(citys, provinceName) {
    let streetsql = [];
    for (const city of citys) {
        // 区、县
        const districts = city.districts;

        for (const dist of districts) {
            // 街道
            let mergerName = `${provinceName}/${city.name}/${dist.name}`;
            let parentId = genCodeId(dist.adcode);
            let count = 100; // 用来区分街道和区县code
            for (const street of dist.districts) {
                count--;
                let numstr = count < 10 ? `0${count}` : count;
                // 发现街道的code和县区一模一样的
                street.adcode = street.adcode + numstr
                let id = genCodeId(street.adcode);
                const sql = getSql(street, mergerName, id, parentId);
                streetsql.push(sql);
            }
        }
    }
    // console.log(streetsql);
    return streetsql;
}
/* 市 */
function crawlerCityData() {
    let promiseAll = [], citysql = [];
    return new Promise((resolve, reject) => {
        qryProvinceNames().then(provinceNames => {
            console.log(provinceNames)
            // provinceNames=['广东省','台湾省','香港特别行政区']
            for (let name of provinceNames) {
                promiseAll.push(queryDistrict(name, 1))
            }
            Promise.all(promiseAll).then(result => {
                result.forEach((citys, index) => {
                    let parentName = provinceNames[index];
                    citys.forEach((city, i) => {
                        let id = genCodeId(city.adcode);
                        let parentId = genCodeId((city.adcode.substr(0, 2) + '0000'));
                        let sql = getSql(city, parentName, id, parentId);
                        citysql = citysql.concat(sql);
                    });
                })
                return resolve(citysql);
            }).catch(e => {
                console.log(e);
                return reject(e);
            })
        });
    });
}
/* 区县 */
let sameCodeCity = ["中山市", "济源市", "东莞市", "北屯市", "双河市", "铁门关市", "昆玉市", "可克达拉市", "石河子市", "五家渠市", "阿拉尔市", "图木舒克市", "天门市", "潜江市", "仙桃市", "神农架林区", "屯昌县", "琼海市", "昌江黎族自治县", "定安县", "琼中黎族苗族自治县", "临高县", "东方市", "白沙黎族自治县", "文昌市", "五指山市", "保亭黎族苗族自治县", "澄迈县", "陵水黎族自治县", "万宁市", "乐东黎族自治县", "儋州市", "嘉峪关市"]; // code和县区一样的市'东莞市', 
let districtIds = [];
const _districtIds = ["659005xxxxxx", "659001xxxxxx", "659002xxxxxx", "659003xxxxxx", "659007xxxxxx", "659004xxxxxx", "659006xxxxxx", "659009xxxxxx", "659008xxxxxx", "659010xxxxxx", "429006xxxxxx", "429001xxxxxx", "429002xxxxxx", "429003xxxxxx", "429004xxxxxx", "429005xxxxxx", "429007xxxxxx", "429008xxxxxx", "429009xxxxxx", "429010xxxxxx", "429011xxxxxx", "429012xxxxxx", "429013xxxxxx", "429014xxxxxx", "429015xxxxxx", "429016xxxxxx", "429017xxxxxx", "429018xxxxxx", "429019xxxxxx", "429020xxxxxx", "429021xxxxxx", "429022xxxxxx", "429023xxxxxx", "429024xxxxxx", "469001xxxxxx", "469002xxxxxx", "469003xxxxxx", "469004xxxxxx", "469005xxxxxx", "469006xxxxxx", "469007xxxxxx", "469008xxxxxx", "469009xxxxxx", "469010xxxxxx", "469011xxxxxx", "469012xxxxxx", "469013xxxxxx", "469014xxxxxx", "469015xxxxxx", "469016xxxxxx"];
function crawlerDistrictData() {
    let distsql = [], districtIds = [];
    return new Promise((resolve, reject) => {
        queryDistrict('中华人民共和国', 3).then(result => {
            for (let province of result) {
                let count2 = 30;
                for (let city of province.districts) {
                    let count = 0;
                    let mergerName = province.name + '/' + city.name;
                    for (let dist of city.districts) {
                        // 特殊处理code一样的情况
                        // 市/区、县级code一样
                        if (sameCodeCity.includes(city.name) && city.adcode.substring(4, 6) === '00') {
                            count++;
                            let num = count < 10 ? `0${count}` : count;
                            dist.adcode = dist.adcode.substr(0, 4) + num;
                        } else if (sameCodeCity.includes(city.name) && city.adcode.substring(4, 6) !== '00') {
                            // 市级为6位code的情况
                            count++;
                            let num = count < 10 ? `0${count}` : count;
                            dist.adcode = dist.adcode + num;
                        }
                        let id = genCodeId(dist.adcode);
                        /*  districtIds.push(id);
                         if (_districtIds.includes(id)) {
                             sameCodeCity.push(city.name)
                         } */
                        let parentId = genCodeId(city.adcode);
                        const sql = getSql(dist, mergerName, id, parentId);
                        distsql.push(sql);
                    }
                }
            }
            // districtIds = duplicates(districtIds);
            // fs.writeFileSync('./sql/districtIds.json', JSON.stringify(districtIds));
            // fs.writeFileSync('./sql/samedistrictCodeCityNames.json', JSON.stringify(_.uniq(sameCodeCity)));
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