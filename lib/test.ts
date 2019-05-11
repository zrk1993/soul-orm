import Orm from './orm';

export const orm = new Orm({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Mysql@123qwer',
  database: 'souljs',
});
