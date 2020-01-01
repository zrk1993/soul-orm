"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbm_1 = require("./dbm");
exports.db = new dbm_1.DBM({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Mysql@123qwer',
    database: 'souljs',
    isDebug: true,
});
(() => __awaiter(this, void 0, void 0, function* () {
    exports.db.reCartesian([], { id: '' });
    const users2 = yield exports.db.table('user').where({ name: 'jake' }).order('age', 'desc').select();
    const users3 = yield exports.db.table('user').where('name = ?', ['jake']).limit(10, 20).select();
    const user4 = yield exports.db.table('user').where({ name: 'jake' }).field('name', 'age').find();
    const user5 = yield exports.db.table('user').where({ name: 'jake' }).findOrEmpty();
    yield exports.db.table('user').insert({ name: 'jake', age: '22' });
    yield exports.db.table('user').insert([{ name: 'jake', age: '22' }, { name: 'jake', age: '22' }]);
    yield exports.db.table('user').where({ name: 'jake' }).update({ name: 'new name' });
    yield exports.db.table('user').where({ name: 'jake' }).delete();
    const tx = yield exports.db.beginTx();
    try {
        yield tx.table('user').insert({ name: 'jake' });
        yield tx.table('user').where({ name: 'jake' }).update({ name: 'new name' });
        yield tx.commit();
    }
    catch (error) {
        yield tx.rollback();
    }
    const result = yield exports.db.query(`SELECT * FROM user U LEFT JOIN user_roles UR ON UR.user_id = U.id WHERE U.type = ?`, ['type']);
}));
//# sourceMappingURL=test.js.map