const fs = require('fs');
const amapCrawler = require('./crawler/amap-district');
const config = require('./db/config');
const connect = require('./db/connect');
const EventProxy = require('eventproxy');

const ep = new EventProxy();

const debug = false;

/* 省数据写入 */
function province() {

    const startTime = new Date().getTime();
    amapCrawler.crawlerProvinceData().then(data => {
        fs.writeFileSync('./sql/province.sql', data.join('\n'));
        provinceTimer(data.length, startTime);
        let count = 0;
        for (let sql of data) {
            if (debug) {
                ep.fire('province_success_done', count);
            } else {
                connect.connection.query(sql, (err, rows, fields) => {
                    if (err) throw err;
                    count++;
                    console.log(count);
                    ep.fire('province_success_done', count);
                });
            }
        }
    })
}



/* 市数据写入 */

function city() {

    const startTime = new Date().getTime();
    amapCrawler.crawlerCityData().then(data => {
        fs.writeFileSync('./sql/city.sql', data.join('\n'));
        cityTimer(data.length, startTime);
        let count = 0;
        for (let sql of data) {
            if (debug) {
                ep.fire('city_success_done', count);
            } else {
                connect.connection.query(sql, (err, rows, fields) => {
                    if (err) throw err;
                    count++;
                    console.log(count);
                    ep.fire('city_success_done', count);
                });
            }

        }
    })
}

/*区县数据写入 */

function district() {

    const startTime = new Date().getTime();
    amapCrawler.crawlerDistrictData().then(data => {
        fs.writeFileSync('./sql/district.sql', data.join('\n'));
        distinctTimer(data.length, startTime);
        let count = 0;
        for (let sql of data) {
            if (debug) {
                ep.fire('distinct_success_done', count);
            } else {
                connect.connection.query(sql, (err, rows, fields) => {
                    if (err) throw err;
                    count++;
                    console.log(count);
                    ep.fire('distinct_success_done', count);
                });
            }
        }
    })
}


/*街道数据写入 */

function street() {
    const startTime = new Date().getTime();
    amapCrawler.crawlerStreetData().then(data => {
        fs.writeFileSync('./sql/street.sql', data.join('\n'));
        streetTimer(data.length, startTime);
        let count = 0;
        for (let sql of data) {
            if (debug) {
                ep.fire('street_success_done', count);
            } else {
                connect.connection.query(sql, (err, rows, fields) => {
                    if (err) throw err;
                    count++;
                    console.log(count);
                    ep.fire('street_success_done', count);
                });
            }
        }
    })
}


// province();
street();



function provinceTimer(length, startTime) {
    ep.after('province_success_done', length, (counts) => {
        let endTime = new Date().getTime();
        console.log(`省级所用时：${endTime - startTime}ms`);
        console.log('更新执行完毕', JSON.stringify(counts));
        city();
        // connect.connection.end();
    });
}

function cityTimer(length, startTime) {
    ep.after('city_success_done', length, (counts) => {
        let endTime = new Date().getTime();
        console.log('更新执行完毕', counts.length);
        console.log(`市级数据所用时：${endTime - startTime}ms`);
        district();
        // connect.connection.end();
    });
}
function distinctTimer(length, startTime) {
    ep.after('distinct_success_done', length, (counts) => {
        let endTime = new Date().getTime();
        console.log('更新执行完毕', counts.length);
        console.log(`区县级数据所用时：${endTime - startTime}ms`);
        street();
        // connect.connection.end();
    });
}
function streetTimer(length, startTime) {
    ep.after('street_success_done', length, (counts) => {
        let endTime = new Date().getTime();
        console.log('更新执行完毕', counts.length);
        console.log(`街道级数据所用时：${endTime - startTime}ms`);
        connect.connection.end();
    });
}