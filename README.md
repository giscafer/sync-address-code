# sync-address-code
sync address code from AMap

## 使用说明

含父子关系的政区数据脚本见分支 [zq-tree](https://github.com/giscafer/sync-address-code/tree/zq-tree)

源码目录说明

- db 为链接mysql数据库配置
- crawler 为高德地图政区数据爬虫脚本
- sql 为爬虫过程生成的sql脚本（2018-10-30 15:00:30）
- app.js 为程序入口

安装依赖

> npm install

`db/config.js` 下设置mysql数据库用户信息，和sql执行表名

> node app

每次脚本执行后，sql文件会更新，`./sql/gaode_address_code.sql` 为省市区县 街道4级数据，`gaode_address_code.xlsx` 为excel格式省市区县街道数据


## Related

- [mongo-js](https://github.com/giscafer/mongo-js) mongodb 数据更新脚本
- [airlevel-crawler](https://github.com/giscafer/airlevel-crawler) air-level.com 数据爬虫demo
- [generate-form-by-table-structure](https://github.com/giscafer/generate-form-by-table-structure) 根据表结构生成表单页面demo

## License

MIT

---

> [giscafer.com](http://giscafer.com) &nbsp;&middot;&nbsp;
> GitHub [@giscafer](https://github.com/giscafer) &nbsp;&middot;&nbsp;
> Twitter [@nickbinglao](https://twitter.com/nickbinglao) &nbsp;&middot;&nbsp;
> Weibo [@Nickbing_Lao](https://weibo.com/laohoubin)
