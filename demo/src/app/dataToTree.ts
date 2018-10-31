/**
 * @author: giscafer
 * @date: 2018-04-03 14:11:51
 * @description:
 */
import { cloneDeep } from 'lodash';

/**
 * 父子关系的原始数据格式化成树形结构数据
 * @param  {Array<Object>} data  原始数据
 * @param  {string} parentField  字段名称，父级，可选
 * @param  {string | number} parentValue  根父级的值，默认undefined或者-1或空
 * @return {Array<Object>}  树形结构数据
 */
export function dataToTree(data, parentField?: string, parentValue?: string | number, codeField?: string, nameField?: string) {
  /*tslint:disable*/
  let _data = cloneDeep(data);
  parentField = parentField || 'parent_id_';
  codeField = codeField || 'id_';
  nameField = nameField || 'name_';

  parentValue = parentValue || '';
  let pos = {},
    tree = [],
    i = 0,
    count = 0,
    len = _data.length;

  while (_data.length !== 0) {
    let item = _data[i];
    item['code'] = item[codeField] || item['code'];
    item['label'] = item['name'] || item[nameField];
    item['level'] = item['level_'];
    item['_data'] = item['code'];
    item['type'] = 'default';
    if (item[parentField] == parentValue || !item[parentField]) {
      item.children = [];
      tree.push(item);

      pos[item.code] = [tree.length - 1];
      _data.splice(i, 1);
      i--;
    } else {
      let posArr = pos[item[parentField]];
      if (posArr != undefined) {

        let obj = tree[posArr[0]];
        for (let j = 1; j < posArr.length; j++) {
          obj = obj.children[posArr[j]];
        }

        item.children = [];

        obj.children.push(item);
        pos[item.code] = posArr.concat([obj.children.length - 1]);
        _data.splice(i, 1);
        i--;
      }
    }
    i++;
    count++;
    if (i > _data.length - 1) {
      i = 0;
    }
    //避免死循环
    if (count > len * 5) {
      return tree;
    }
  }
  /*tslint:ensable*/
  return tree;
}
