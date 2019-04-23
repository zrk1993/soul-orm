import * as mysql from 'mysql';
import * as orm from './lib/orm';

export const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Mysql@123qwer',
  database: 'souljs',
});

pool.on('error', error => {
  // tslint:disable-next-line:no-console
  console.error(error.message);
});

pool.query('SELECT 1', error => {
  if (error) {
    // tslint:disable-next-line:no-console
    console.error(error.message);
  } else {
    // tslint:disable-next-line:no-console
    console.info('mysql连接成功！');
  }
});

orm.init(pool);

export * from './lib/orm';
