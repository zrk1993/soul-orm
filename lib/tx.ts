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

  public async commit() {
    await this.conn.commit();
  }

  public async rollback() {
    await this.conn.rollback();
  }
}
