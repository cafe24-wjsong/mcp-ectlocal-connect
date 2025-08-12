import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env') });

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema: string;
}

export class DatabaseManager {
  private pool: Pool;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'ectlocal.cafe24.com',
      port: parseInt(process.env.DB_PORT || '5434'),
      database: process.env.DB_NAME || 'mall',
      user: process.env.DB_USER || 'malluser',
      password: process.env.ECTLOCAL_DB_PASSWORD || '',
      schema: process.env.DB_SCHEMA || 'ec_ectlocal'
    };

    if (!this.config.password) {
      throw new Error('ECTLOCAL_DB_PASSWORD 환경변수가 설정되지 않았습니다.');
    }

    const poolConfig: PoolConfig = {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(poolConfig);
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query(`SET search_path TO ${this.config.schema}`);
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getTableStructure(tableName: string) {
    const queries = {
      primaryKeys: `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = $1
            AND tc.table_name = $2
            AND tc.constraint_type = 'PRIMARY KEY'
        ORDER BY kcu.ordinal_position;
      `,
      indexes: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = $1
            AND tablename = $2;
      `,
      columns: `
        SELECT 
            ordinal_position AS pos,
            column_name,
            data_type,
            CASE 
                WHEN character_maximum_length IS NOT NULL 
                THEN '(' || character_maximum_length || ')'
                ELSE ''
            END AS length,
            is_nullable AS nullable,
            column_default AS default_value
        FROM information_schema.columns 
        WHERE table_schema = $1 
            AND table_name = $2
        ORDER BY ordinal_position;
      `,
      stats: `
        SELECT 
            n_live_tup AS row_count,
            pg_size_pretty(pg_total_relation_size($1 || '.' || $2)) AS total_size
        FROM pg_stat_user_tables
        WHERE schemaname = $1
            AND relname = $2;
      `
    };

    const [primaryKeys, indexes, columns, stats] = await Promise.all([
      this.query(queries.primaryKeys, [this.config.schema, tableName]),
      this.query(queries.indexes, [this.config.schema, tableName]),
      this.query(queries.columns, [this.config.schema, tableName]),
      this.query(queries.stats, [this.config.schema, tableName])
    ]);

    return {
      primaryKeys: primaryKeys.rows,
      indexes: indexes.rows,
      columns: columns.rows,
      stats: stats.rows[0] || {}
    };
  }

  async getAllTables() {
    const result = await this.query(
      'SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename',
      [this.config.schema]
    );
    return result.rows;
  }

  async close() {
    await this.pool.end();
  }
}