import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  {
    name: 'execute_query',
    description: 'PostgreSQL 데이터베이스에서 SQL 쿼리를 실행합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '실행할 SQL 쿼리'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_table_structure',
    description: '테이블의 구조, 인덱스, 통계 정보를 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: {
          type: 'string',
          description: '조회할 테이블 이름'
        }
      },
      required: ['table_name']
    }
  },
  {
    name: 'list_tables',
    description: 'ec_ectlocal 스키마의 모든 테이블 목록을 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_order',
    description: '특정 주문 ID로 주문 정보를 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: '조회할 주문 ID (예: 20250804-0000020)'
        }
      },
      required: ['order_id']
    }
  },
  {
    name: 'get_order_detail',
    description: '주문 상세 정보를 order_manage 테이블과 함께 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: '조회할 주문 ID (예: 20250804-0000020)'
        }
      },
      required: ['order_id']
    }
  },
  {
    name: 'get_member',
    description: '회원 ID로 회원 정보를 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        member_id: {
          type: 'string',
          description: '조회할 회원 ID'
        }
      },
      required: ['member_id']
    }
  }
];