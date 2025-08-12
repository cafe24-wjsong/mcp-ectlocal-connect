#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { DatabaseManager } from './database.js';
import { tools } from './tools.js';
import { ToolHandlers } from './handlers.js';

class EctlocalConnectServer {
  private server: Server;
  private db!: DatabaseManager;
  private handlers!: ToolHandlers;

  constructor() {
    this.server = new Server(
      {
        name: 'ectlocal-connect',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'execute_query':
            return await this.handlers.handleExecuteQuery(args);
          case 'get_table_structure':
            return await this.handlers.handleGetTableStructure(args);
          case 'list_tables':
            return await this.handlers.handleListTables(args);
          case 'get_order':
            return await this.handlers.handleGetOrder(args);
          case 'get_order_detail':
            return await this.handlers.handleGetOrderDetail(args);
          case 'get_member':
            return await this.handlers.handleGetMember(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `알 수 없는 도구: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `도구 실행 오류: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      if (this.db) {
        await this.db.close();
      }
      await this.server.close();
      process.exit(0);
    });
  }

  async initialize(): Promise<void> {
    try {
      this.db = new DatabaseManager();
      this.handlers = new ToolHandlers(this.db);
      console.error('Ectlocal Connect MCP 서버가 시작되었습니다.');
    } catch (error) {
      console.error('데이터베이스 초기화 실패:', error);
      throw error;
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP 서버가 stdio를 통해 연결되었습니다.');
  }
}

async function main(): Promise<void> {
  const server = new EctlocalConnectServer();
  await server.initialize();
  await server.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { EctlocalConnectServer };