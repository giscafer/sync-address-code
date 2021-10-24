const fs = require('fs-extra');
const cityIndexList = require('./cityIndex.json');
const cityLevelList = require('./city-level.json');

const iterate = (cityNode, name) => {
  const hasChildren = cityNode.children?.length > 0;

  if (!hasChildren) {
    return false;
  }
  for (const city of cityNode.children) {
    if (city.name === name) {
      return city;
    } else {
      iterate(city);
    }
  }
};

// 获取政区code
function convert() {
  const result = [];
  for (const cityIndexItem of cityIndexList) {
    const { sortLetters, items } = cityIndexItem;
    const newItem = { sortLetters, items: [] };
    for (const item of items) {
      const { name } = item;
      for (const cityNode of cityLevelList) {
        const city = iterate(cityNode, name);
        if (city) {
          const cityCode = `${city.province}${city.city}00`;
          newItem.items.push({
            ...item,
            code: city.code,
            province: city.province + '0000',
            city: cityCode === city.code ? '' : cityCode,
          });
        }
      }
    }
    result.push(newItem);
  }
  fs.writeFileSync('./cityIndex2.json', JSON.stringify(result, null, 2));
}

convert();
