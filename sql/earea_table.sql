CREATE TABLE `earea_` (
  `id_` varchar(16) COLLATE utf8_bin NOT NULL COMMENT '主键',
  `date_created_` datetime(6) NOT NULL COMMENT '最初创建时间',
  `disabled_` decimal(1,0) NOT NULL COMMENT '是否有效',
  `last_updated_` datetime(6) NOT NULL COMMENT '最后更新时间',
  `version_` int(11) NOT NULL COMMENT '乐观锁版本号',
  `code_` varchar(16) COLLATE utf8_bin NOT NULL COMMENT '行政代码',
  `lat_` decimal(19,8) DEFAULT NULL COMMENT '纬度',
  `level_` smallint(6) NOT NULL COMMENT '层级',
  `lng_` decimal(19,8) DEFAULT NULL COMMENT '经度',
  `merger_name_` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '组合名称',
  `name_` varchar(50) COLLATE utf8_bin DEFAULT NULL COMMENT '名称',
  `pinyin_` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '拼音',
  `short_name_` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '简称',
  `tel_code_` varchar(255) COLLATE utf8_bin NOT NULL COMMENT '电话区号',
  `zip_code_` varchar(255) COLLATE utf8_bin NOT NULL COMMENT '邮政编码',
  `parent_id_` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id_`),
  UNIQUE KEY `UK_dhvsonn2s67wukqohu5do7rte_code_` (`code_`) USING BTREE,
  KEY `fktgdyxr8dq43ywpx90s1axc9nw_` (`parent_id_`),
  CONSTRAINT `fksv1s9vvxl0c47oxg5iec7g8yo_` FOREIGN KEY (`parent_id_`) REFERENCES `earea_` (`id_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='五级区域表';


/* INSERT INTO earea_ (
	id_,
	date_created_,
	disabled_,
	last_updated_,
	version_,
	code_,
	lat_,
	level_,
	lng_,
	merger_name_,
	name_,
	pinyin_,
	short_name_,
	tel_code_,
	zip_code_,
	parent_id_
)
VALUES
	(
		'000000000000',
		'2017-04-23 04:17:29',
		0,
		'2017-04-23 04:17:29',
		0,
		'000000000000',
		39.90,
		- 1,
		116.41,
		'中国',
		'中国',
		'Zhongguo',
		'中国',
		'+86',
		'000000',
		NULL
	); */