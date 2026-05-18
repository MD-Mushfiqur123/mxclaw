declare module "better-sqlite3" {
  interface Database {
    pragma(sql: string): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    close(): void;
    transaction<T extends (...args: unknown[]) => unknown>(fn: T): T;
  }

  interface Statement {
    run(...params: unknown[]): { changes: number };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  interface DatabaseConstructor {
    new (path: string, options?: Record<string, unknown>): Database;
    (path: string, options?: Record<string, unknown>): Database;
  }

  const Database: DatabaseConstructor;
  export = Database;
  export type { Database as DatabaseType };
}
