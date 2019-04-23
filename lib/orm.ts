import * as mysql from 'mysql';
import { QueryBuilder, Tx } from './';

let pool: mysql.Pool;

export async function query(sql: string, values?: any | mysql.QueryOptions, options?: mysql.QueryOptions): Promise<any[]> {
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
    pool.query(opt, (err: Error, results: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function getPoolConnection(): Promise<mysql.PoolConnection> {
  return new Promise((res, rej) => {
    pool.getConnection((err: Error, connection: mysql.PoolConnection) => {
      if (err) {
        rej(err);
      } else {
        res(connection);
      }
    });
  });
}

export function table(tb: string): QueryBuilder {
  return QueryBuilder.table(tb, { queryFunction: query });
}

export async function beginTx() {
  const conn = await getPoolConnection();

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
    query,
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

export function init(p: mysql.Pool) {
  pool = p;
}
