const config = require('./config');
const connect = require('./connect');
const _ = require('lodash');

/* const sql = `SELECT
id_,name_,code_
FROM
earea_
WHERE
name_ IN (
    "中山市",
    "济源市",
    "东莞市",
    "北屯市",
    "双河市",
    "铁门关市",
    "昆玉市",
    "可克达拉市",
    "石河子市",
    "五家渠市",
    "阿拉尔市",
    "图木舒克市",
    "天门市",
    "潜江市",
    "仙桃市",
    "神农架林区",
    "屯昌县",
    "琼海市",
    "昌江黎族自治县",
    "定安县",
    "琼中黎族苗族自治县",
    "临高县",
    "东方市",
    "白沙黎族自治县",
    "文昌市",
    "五指山市",
    "保亭黎族苗族自治县",
    "澄迈县",
    "陵水黎族自治县",
    "万宁市",
    "乐东黎族自治县",
    "儋州市",
    "嘉峪关市"
);`; */

const sql=`SELECT
id_,
name_,
code_,
level_
FROM
earea_
WHERE
parent_id_ IN (
    '419001xxxxxx',
    '429004xxxxxx',
    '429005xxxxxx',
    '429006xxxxxx',
    '429021xxxxxx',
    '441900xxxxxx',
    '442000xxxxxx',
    '460400xxxxxx',
    '469001xxxxxx',
    '469002xxxxxx',
    '469005xxxxxx',
    '469006xxxxxx',
    '469007xxxxxx',
    '469021xxxxxx',
    '469022xxxxxx',
    '469023xxxxxx',
    '469024xxxxxx',
    '469025xxxxxx',
    '469026xxxxxx',
    '469027xxxxxx',
    '469028xxxxxx',
    '469029xxxxxx',
    '469030xxxxxx',
    '620200xxxxxx',
    '659001xxxxxx',
    '659002xxxxxx',
    '659003xxxxxx',
    '659004xxxxxx',
    '659005xxxxxx',
    '659006xxxxxx',
    '659007xxxxxx',
    '659008xxxxxx',
    '659009xxxxxx'
);`
connect.connection.query(sql, (err, rows, fields) => {
    if (err) throw err;
    let result = JSON.parse(JSON.stringify(rows));
    let names = _.map(result, 'name_');
    let codes = _.map(result, 'code_');
    let ids = _.map(result, 'id_');
    // console.log(ids)
    console.log(_.zipObject(names, ids));
});

/* const insertSql = `INSERT INTO test VALUES (null, '中华人民共和国', '', '100000')`;
connect.connection.query(insertSql, (err, rows, fields) => {
    if (err) throw err;
    console.log(`插入数量：${rows.affectedRows}`);
}); */

connect.connection.end();

