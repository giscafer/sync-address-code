/**
 * 测试mysql数据库连接
 * @type {[type]}
 */
const mysql = require('mysql');
const dbconfig = require('./config');
const connection = mysql.createConnection(dbconfig);

connection.connect(function (err, res) {
    if (err) {
        console.error('connect to db is err:' + err);
    }
    // console.log(res);
});

module.exports = {
    connection
}
// connection.end();