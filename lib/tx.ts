import { QueryBuilder, IQueryFunction } from './query-builder';

export interface IConnection {
  query: IQueryFunction;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

export class Tx {
  private conn: IConnection;

  constructor(conn: IConnection) {
    this.conn = conn;
  }

  public table(tb: string): QueryBuilder {
    return QueryBuilder.table(tb, { queryFunction: this.conn.query });
  }

  async query(sql: string, values?: any, options?: any): Promise<any[]> {
    let opt = null;
    if (options) {
      opt = Object.assign(options, { sql, values });
    } else if (values) {
      if (Array.isArray(values)) {
        opt = { sql, values };
      } else {
        opt = Object.assign(values, { sql });
      }
    } else {
      opt = { sql };
    }
    return this.conn.query(opt);
  }

  public async commit() {
    await this.conn.commit();
  }

  public async rollback() {
    await this.conn.rollback();
  }
}
