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
const sqlstring = require("sqlstring");
class QueryBuilder {
    constructor({ table, queryFunction }) {
        this.$field = ['*'];
        this.$table = 't_' + table;
        this.queryFunction = queryFunction;
    }
    static table(table, opt) {
        return new QueryBuilder({ table, queryFunction: opt.queryFunction });
    }
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = '';
            const inserts = [];
            sql += `SELECT ${this.$field.join(', ')} FROM ${this.$table}`;
            if (this.$where)
                sql += ` WHERE ${this.$where}`;
            if (this.$order) {
                sql += ` ORDER BY ${this.$order}`;
            }
            if (typeof this.$limit !== 'undefined') {
                sql += ` LIMIT ?`;
                inserts.push(this.$limit);
                if (this.$offset) {
                    sql += `,?`;
                    inserts.push(this.$offset);
                }
            }
            this.sql = sqlstring.format(sql, inserts);
            const result = yield this.exec();
            return result;
        });
    }
    findOrEmpty() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.limit) {
                this.$limit = 1;
            }
            const result = (yield this.select())[0] || null;
            return result;
        });
    }
    find() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.findOrEmpty();
            if (!result) {
                throw new Error(`Record lookup failed！`);
            }
            return result;
        });
    }
    insert(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertData = param[0] ? param : [param];
            const colums = Object.keys(insertData[0]);
            const values = insertData.map((item) => {
                return `(${colums.map(c => sqlstring.escape(item[c])).join(',')})`;
            });
            const sql = `INSERT INTO ?? (??) VALUES ${values.join(',')}`;
            const inserts = [this.$table, colums];
            this.sql = sqlstring.format(sql, inserts);
            const result = yield this.exec();
            if (result.affectedRows !== insertData.length) {
                throw new Error('affectedRows not equal data length!');
            }
            return result;
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = Object.keys(data);
            const inserts = [];
            inserts.push(this.$table);
            const update = keys.map(key => {
                inserts.push(key, data[key]);
                return `??=?`;
            }).join(',');
            let sql = `UPDATE ?? SET ${update}`;
            if (this.$where)
                sql += ` WHERE ${this.$where}`;
            if (this.$limit) {
                sql += ` LIMIT ?`;
                inserts.push(this.$limit);
            }
            this.sql = sqlstring.format(sql, inserts);
            const result = yield this.exec();
            if (this.$limit && result.changedRows !== this.$limit) {
                throw new Error('changedRows not equal limit!');
            }
            return result.changedRows;
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = `DELETE FROM ${this.$table}`;
            if (this.$where)
                sql += ` WHERE ${this.$where}`;
            const inserts = [];
            if (this.$limit) {
                sql += ` LIMIT ?`;
                inserts.push(this.$limit);
            }
            this.sql = sqlstring.format(sql, inserts);
            const result = yield this.exec();
            if (this.$limit && result.affectedRows !== this.$limit) {
                throw new Error('affectedRows not equal limit!');
            }
            return result.affectedRows;
        });
    }
    where(...args) {
        let sql = '';
        let values = [];
        if (typeof args[0] === 'string') {
            sql = args[0];
            values = args[1];
        }
        else {
            const keys = Object.keys(args[0]).filter(k => args[0][k] !== undefined);
            sql = keys.map(() => `?? = ?`).join(' AND ');
            values = [];
            keys.forEach((key) => {
                values.push(key, args[0][key]);
            });
        }
        if (this.$where)
            this.$where += ' AND ';
        else
            this.$where = '';
        this.$where += sqlstring.format(sql, values);
        return this;
    }
    limit(limit, offset) {
        this.$limit = +limit;
        this.$offset = +offset;
        return this;
    }
    order(field, od) {
        this.$order = `${field} ${od}`;
        return this;
    }
    field(...args) {
        this.$field = args.join(',').split(',');
        return this;
    }
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.queryFunction(this.sql);
            return result;
        });
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map