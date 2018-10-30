const config = require('./config');
const connect = require('./connect');
const _ = require('lodash');

/* const sql = `SELECT * FROM ${config.tableName}`;
connect.connection.query(sql, (err, rows, fields) => {
    if (err) throw err;
    const columnNames = _.map(rows, 'name');
    console.log(rows);
    console.log(columnNames);
}); */

const insertSql = `INSERT INTO test VALUES (null, '中华人民共和国', '', '100000')`;
connect.connection.query(insertSql, (err, rows, fields) => {
    if (err) throw err;
    console.log(`插入数量：${rows.affectedRows}`);
});

connect.connection.end();