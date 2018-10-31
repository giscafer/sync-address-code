function duplicates(arr) {
    var a = [], obj = {};
    for (var i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) {
            obj[arr[i]] = 1;
            continue;
        }
        obj[arr[i]]++;
    }
    for (key in obj) {
        if (obj[key] > 1) {
            a.push(key);
        }
    }
    return a;
}


module.exports = duplicates;