import * as mysql from 'mysql';
import { QueryBuilder, Tx } from './';

export default class Orm {
  private pool: mysql.Pool;

  constructor(poolConfig: mysql.PoolConfig) {
    this.pool = mysql.createPool(poolConfig);

    this.pool.on('error', error => {
      // tslint:disable-next-line:no-console
      console.error('soul-orm: ', error.message);
    });
    
    this.pool.query('SELECT 1', error => {
      if (error) {
        // tslint:disable-next-line:no-console
        console.error('soul-orm: ', error.message);
      } else {
        // tslint:disable-next-line:no-console
        console.info('mysql连接成功！');
      }
    });
  }

  async query(sql: string, values?: any | mysql.QueryOptions, options?: mysql.QueryOptions): Promise<any[]> {
    let opt = null;
    if (arguments.length === 3) {
      opt = Object.assign(options, { sql: options, values });
    } else if (arguments.length === 2) {
      if (Array.isArray(values)) {
        opt = { sql, values };
      } else {
        opt = Object.assign(values, { sql });
      }
    } else {
      opt = { sql };
    }
    return new Promise((resolve, reject) => {
      this.pool.query(opt, (err: Error, results: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  table(tb: string): QueryBuilder {
    return QueryBuilder.table(tb, { queryFunction: this.query });
  }

  private async getPoolConnection(): Promise<mysql.PoolConnection> {
    return new Promise((res, rej) => {
      this.pool.getConnection((err: Error, connection: mysql.PoolConnection) => {
        if (err) {
          rej(err);
        } else {
          res(connection);
        }
      });
    });
  }

  async beginTx() {
    const conn = await this.getPoolConnection();

    await new Promise((resolve, reject) => {
      conn.beginTransaction((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return new Tx({
      query: async (sql: string): Promise<any> => {
        return new Promise((resolve, reject) => {
          conn.query(sql, (err: Error, results: any[]) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      },
      commit: async () => {
        return new Promise((resolve, reject) => {
          conn.commit((err: Error) => {
            conn.release();
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      },
      rollback: async () => {
        return new Promise((resolve) => {
          conn.rollback(() => {
            conn.release();
            resolve();
          });
        });
      },
    });
  }
}
