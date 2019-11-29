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
const query_builder_1 = require("./query-builder");
class Tx {
    constructor(conn) {
        this.conn = conn;
    }
    table(tb) {
        return query_builder_1.QueryBuilder.table(tb, { queryFunction: this.conn.query });
    }
    query(sql, values, options) {
        return __awaiter(this, arguments, void 0, function* () {
            let opt = null;
            if (arguments.length === 3) {
                opt = Object.assign(options, { sql, values });
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
            return this.conn.query(opt);
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.conn.commit();
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.conn.rollback();
        });
    }
}
exports.Tx = Tx;
//# sourceMappingURL=tx.js.map