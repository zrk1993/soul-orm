"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function reCartesian(dataList, structure, results = []) {
    const keyMap = {};
    dataList.forEach(row => {
        const [table, id] = structure.id.split('.');
        const key = row[table][id];
        if (key === null)
            return;
        if (!keyMap[key]) {
            keyMap[key] = [];
            row[table].groups = () => keyMap[key];
            results.push(row[table]);
        }
        keyMap[key].push(row);
    });
    Object.keys(structure)
        .filter(k => !['id'].find(it => k === it))
        .forEach((key) => {
        const value = structure[key];
        const stru = Array.isArray(value) ? value[0] : value;
        results.forEach(row => {
            const data = reCartesian(row.groups(), typeof stru === 'string' ? { id: stru } : stru);
            row[key] = Array.isArray(value) ? data : data[0];
        });
    });
    return results;
}
exports.reCartesian = reCartesian;
//# sourceMappingURL=re-cartesian.js.map