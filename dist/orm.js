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
const mysql = require("mysql");
const _1 = require("./");
let pool;
class Orm {
    constructor(poolConfig) {
        this.logger = console;
        this.reCartesian = _1.reCartesian;
        pool = mysql.createPool(poolConfig);
        pool.on('error', error => {
            this.logger.error('soul-orm: ', error.message);
        });
        pool.query('SELECT 1', error => {
            if (error) {
                this.logger.error('soul-orm: ', error.message);
            }
            else {
                this.logger.info('mysql连接成功！');
            }
        });
    }
    setLogger(logger) {
        this.logger = logger;
    }
    query(sql, values, options) {
        return __awaiter(this, arguments, void 0, function* () {
            let opt = null;
            if (arguments.length === 3) {
                opt = Object.assign(options, { sql: options, values });
            }
            else if (arguments.length === 2) {
                if (Array.isArray(values)) {
                    opt = { sql, values };
                }
                else {
                    opt = Object.assign(values, { sql });
                }
            }
            else {
                opt = { sql };
            }
            return new Promise((resolve, reject) => {
                pool.query(opt, (err, results) => {
                    if (err) {
                        err.message += sql;
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                });
            });
        });
    }
    table(tb) {
        return _1.QueryBuilder.table(tb, { queryFunction: this.query });
    }
    getPoolConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.getConnection((err, connection) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(connection);
                    }
                });
            });
        });
    }
    beginTx() {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getPoolConnection();
            yield new Promise((resolve, reject) => {
                conn.beginTransaction((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            return new _1.Tx({
                query: (sql) => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        conn.query(sql, (err, results) => {
                            if (err) {
                                err.message += sql;
                                reject(err);
                            }
                            else {
                                resolve(results);
                            }
                        });
                    });
                }),
                commit: () => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        conn.commit((err) => {
                            conn.release();
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                }),
                rollback: () => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve) => {
                        conn.rollback(() => {
                            conn.release();
                            resolve();
                        });
                    });
                }),
            });
        });
    }
}
exports.Orm = Orm;
//# sourceMappingURL=orm.js.map