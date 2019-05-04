import * as sqlstring from 'sqlstring';

export type IQueryFunction = (options: string) => Promise<any>;

export class QueryBuilder {

  private $table: string;
  private $field: string[] = ['*'];
  private $where: string = '1=1';
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

  public async select(): Promise<any[]> {
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

  public async findOrEmpty(): Promise<any> {
    if (!this.limit) {
      this.$limit = 1;
    }
    const result = (await this.select())[0];
    return result;
  }

  public async find(): Promise<any> {
    const result = await this.findOrEmpty();
    if (!result) {
      throw new Error(`${this.$table} is not found`);
    }
    return result;
  }

  public async insert(data: any): Promise<number>;
  public async insert(data: any[]): Promise<void>;
  public async insert(param: any | any[]): Promise<any> {
    const insertData: any[] = param[0] ? param : [param];
    const colums = Object.keys(insertData[0]);
    const values = insertData.map((item) => {
      return `(${colums.map(c => sqlstring.escape(item[c])).join(',')})`;
    });

    const sql = `INSERT INTO ?? (??) VALUES ${values.join(',')}`;
    const inserts = [this.$table, colums];
    this.sql = sqlstring.format(sql, inserts);
    const result = await this.exec();
    if (result.affectedRows !== insertData.length) {
      throw new Error('affectedRows not equal data length!');
    }
    return result;
  }

  public async update(data: any): Promise<void> {
    const keys = Object.keys(data);
    const inserts = [this.$table];
    const update = keys.map(key => {
      inserts.push(key, data[key]);
      return `??=?`;
    }).join(',');
    const sql = `UPDATE ?? SET ${update} WHERE ${this.$where}`;
    this.sql = sqlstring.format(sql, inserts);
    const result = await this.exec();
    return result.changedRows;
  }

  public async delete(rows?: number): Promise<void> {
    const sql = `DELETE FROM ${this.$table} WHERE ${this.$where}`;
    const inserts = [this.$table];
    this.sql = sqlstring.format(sql, inserts);
    const result = await this.exec();
    if (rows && result.affectedRows !== rows) {
      throw new Error('affectedRows not equal rows!');
    }
    return result.affectedRows;
  }

  public where(where: any): QueryBuilder;
  public where(where: string, valus?: any[]): QueryBuilder;
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

  private async exec(): Promise<void | any[] | any> {
    const result: any = await this.queryFunction(this.sql);
    return result;
  }
}
