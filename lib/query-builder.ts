import * as sqlstring from 'sqlstring';

export type IQueryFunction = (options: string) => Promise<any>;

export class QueryBuilder {

  private $table: string;
  private $field: string[] = ['*'];
  private $where: string;
  private $limit: number;
  private $offset: number;
  private $order: string;

  private sql: string;
  private queryFunction: IQueryFunction;

  public static table(table: string, opt: { queryFunction: IQueryFunction }): QueryBuilder {
    return new QueryBuilder({ table, queryFunction: opt.queryFunction });
  }

  private constructor({ table, queryFunction }) {
    this.$table = table;
    this.queryFunction = queryFunction;
  }

  public async select(): Promise<object[]> {
    let sql = '';
    const inserts = [];

    sql += `SELECT ?? FROM ?? WHERE ${this.$where}`;

    inserts.push(this.$field, this.$table);

    if (this.$order) {
      sql += ` ORDER BY ${this.$order}`;
    }

    if (this.$limit) {
      sql += ` LIMIT ?`;
      inserts.push(this.$limit);
      if (this.$offset) {
        sql += `,?`;
        inserts.push(this.$offset);
      }
    }

    this.sql = sqlstring.format(sql, inserts);
    const result: any = await this.exec();
    return result;
  }

  public async find(): Promise<object> {
    if (!this.limit) {
      this.$limit = 1;
    }
    const result = await this.select();
    return result[0];
  }

  public insert(data: object): number;
  public insert(data: object[]): void;
  public insert(data: object | object[]): void | number {
    const insertData: any = data[0] ? data : [data];
    const colums = Object.keys(insertData[0]);
    const values = insertData.map((item) => {
      return `(${colums.map(c => sqlstring.escape(item[c])).join(',')})`;
    });

    const sql = `INSERT INTO ?? (??) VALUES ${values.join(',')}`;
    const inserts = [this.$table, colums];
    this.sql = sqlstring.format(sql, inserts);
  }

  public async update(data: object): Promise<void> {
    const keys = Object.keys(data);
    const update = keys.map(key => `${sqlstring.escape(key)}=?}`).join(',');
    const sql = `UPDATE ?? SET ${update} WHERE ${this.$where}`;
    const inserts = [this.$table, ...keys.map(k => data[k])];
    this.sql = sqlstring.format(sql, inserts);
    await this.exec();
  }

  public async delete(): Promise<void> {
    const sql = `DELETE FROM ${this.$table} WHERE ${this.$where}`;
    const inserts = [this.$table];
    this.sql = sqlstring.format(sql, inserts);
    await this.exec();
  }

  public where(where: object): QueryBuilder;
  public where(where: string, valus?: []): QueryBuilder;
  public where(...args: any): QueryBuilder {
    let sql = '';
    let values = [];
    if (typeof args[0] === 'string') {
      sql = args[0];
      values = args[1];
    } else {
      const keys = Object.keys(args[0]);
      sql = keys.map(key => `?? = ?`).join('AND');
      values = [];
      keys.forEach((key) => {
        values.push(key, args[0][key]);
      });
    }

    this.$where = sqlstring.format(sql, values);
    return this;
  }

  public limit(limit: number, offset?: number) {
    this.$limit = limit;
    this.$offset = offset;
    return this;
  }

  public order(field: string, od: string) {
    this.$order = `${sqlstring.escape(field)} ${sqlstring.escape(od)}`;
    return this;
  }

  public field(...args: string[]) {
    this.$field = args.join(',').split(',');
    return this;
  }

  private async exec(): Promise<void | any[]> {
    const result: any = await this.queryFunction(this.sql);
    return result;
  }
}
