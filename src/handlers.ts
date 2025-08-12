import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from './database.js';

export class ToolHandlers {
  constructor(private db: DatabaseManager) {}

  async handleExecuteQuery(args: any) {
    try {
      const { query } = args;
      const result = await this.db.query(query);
      
      return {
        content: [
          {
            type: 'text',
            text: `쿼리 실행 완료:\n\n결과: ${result.rowCount}행\n\n${JSON.stringify(result.rows, null, 2)}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `쿼리 실행 오류: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleGetTableStructure(args: any) {
    try {
      const { table_name } = args;
      const structure = await this.db.getTableStructure(table_name);
      
      let result = `테이블 구조: ${table_name}\n\n`;
      
      result += '=== PRIMARY KEY ===\n';
      if (structure.primaryKeys.length > 0) {
        result += structure.primaryKeys.map((pk: any) => pk.column_name).join(', ') + '\n';
      } else {
        result += '없음\n';
      }
      
      result += '\n=== INDEXES ===\n';
      if (structure.indexes.length > 0) {
        structure.indexes.forEach((idx: any) => {
          result += `${idx.indexname}: ${idx.indexdef}\n`;
        });
      } else {
        result += '없음\n';
      }
      
      result += '\n=== COLUMNS ===\n';
      structure.columns.forEach((col: any) => {
        result += `${col.pos}. ${col.column_name} ${col.data_type}${col.length} ${col.nullable === 'YES' ? 'NULL' : 'NOT NULL'}`;
        if (col.default_value) {
          result += ` DEFAULT ${col.default_value}`;
        }
        result += '\n';
      });
      
      result += '\n=== TABLE STATS ===\n';
      if (structure.stats.row_count !== undefined) {
        result += `행 수: ${structure.stats.row_count}\n`;
        result += `크기: ${structure.stats.total_size}\n`;
      } else {
        result += '통계 정보 없음\n';
      }
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `테이블 구조 조회 오류: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleListTables(args: any) {
    try {
      const tables = await this.db.getAllTables();
      const tableList = tables.map((table: any) => table.tablename).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `ec_ectlocal 스키마의 테이블 목록:\n\n${tableList}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `테이블 목록 조회 오류: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleGetOrder(args: any) {
    try {
      const { order_id } = args;
      const query = `
        SELECT 
            order_id, member_id, order_date, payed_amount, is_payed, is_shipped, 
            paymethod, bank_code, c_r_name, c_r_addr1, 
            r_zipcode, c_r_phone1, ship_fee, 
            mileage_used, coupon_price, deposit_used
        FROM orders 
        WHERE order_id = $1
      `;
      
      const result = await this.db.query(query, [order_id]);
      
      if (result.rows.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `주문을 찾을 수 없습니다: ${order_id}`
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `주문 정보: ${order_id}\n\n${JSON.stringify(result.rows[0], null, 2)}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `주문 조회 오류: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleGetOrderDetail(args: any) {
    try {
      const { order_id } = args;
      const query = `
        SELECT 
            o.order_id,
            o.member_id,
            o.order_date,
            o.payed_amount,
            o.is_payed,
            o.is_shipped,
            o.paymethod,
            o.c_r_name,
            o.c_r_addr1,
            o.ship_fee,
            om.om_no,
            om.product_no,
            om.quantity,
            om.cur_state,
            om.order_status,
            om.manage_id,
            om.place_date,
            om.shipbegin_date,
            om.shipend_date,
            om.cancel_date
        FROM orders o
        LEFT JOIN order_manage om ON o.order_id = om.order_id
        WHERE o.order_id = $1
      `;
      
      const result = await this.db.query(query, [order_id]);
      
      if (result.rows.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `주문을 찾을 수 없습니다: ${order_id}`
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `주문 상세 정보: ${order_id}\n\n${JSON.stringify(result.rows, null, 2)}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `주문 상세 조회 오류: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleGetMember(args: any) {
    try {
      const { member_id } = args;
      const query = `
        SELECT 
            member_id, group_no, type, priv,
            c_name, nick_name, c_email, c_phone, c_mobile,
            c_add1, c_add2, sex,
            regist_date, last_login_date,
            buy_num, total_mileage, avail_mileage
        FROM member 
        WHERE member_id = $1
      `;
      
      const result = await this.db.query(query, [member_id]);
      
      if (result.rows.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `회원을 찾을 수 없습니다: ${member_id}`
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `회원 정보: ${member_id}\n\n${JSON.stringify(result.rows[0], null, 2)}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `회원 조회 오류: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
}