import mysql, { Pool } from "mysql2/promise";

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  const {
    DB_HOST = "127.0.0.1",
    DB_PORT = "3306",
    DB_USER = "root",
    DB_PASSWORD = "root",
    DB_DATABASE = "mywebapp",
  } = process.env;

  _pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    charset: "utf8mb4_general_ci",
  });
  return _pool;
}
