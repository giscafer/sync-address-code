const fs = require('fs-extra');
const cityIndexList = require('./cityIndex');
const areasList = require('./areas.json');
// const cityLevelList = require('./city-level.json');

function convert() {
  const result = [];
  for (const cityIndexItem of cityIndexList) {
    const { sortLetters, items } = cityIndexItem;
    const newItem = { sortLetters, items: [] };
    for (const item of items) {
      const { name, sortLetters, pinyin, index } = item;
      for (const area of areasList) {
        const isCity = area.area === '' && area.city.indexOf(name) === 0;
        if (area.area === name || isCity) {
          item.lat = area.lat;
          item.lng = area.lng;
          let newName = area.area;
          if (isCity) {
            newName = area.city;
          }
          newItem.items.push({
            index,
            shortName: item.name,
            name: newName,
            sortLetters,
            pinyin,
            lat: item.lat - 0,
            lng: item.lng - 0,
            address: `${area.province}/${area.city}${
              area.area ? `/${area.area}` : ''
            }`,
          });
        }
      }
    }
    result.push(newItem);
  }
  fs.writeFileSync('./cityIndex.json', JSON.stringify(result, null, 2));
}

convert();
