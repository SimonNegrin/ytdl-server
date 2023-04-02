import { readFileSync } from 'node:fs'
import betterSqlite3 from "better-sqlite3"

export default async function setup() {
  const db = betterSqlite3(process.env.DATABASE_PATH)
  const schema = readFileSync('schema.sql', 'utf-8')
  db.pragma("journal_mode = WAL")
  db.exec(schema)
}
