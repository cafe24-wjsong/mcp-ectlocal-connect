# Ectlocal Connect MCP Server

EC 솔루션의 PostgreSQL 데이터베이스에 접속하여 주문, 회원 등 이커머스 데이터를 조회하고 관리할 수 있는 MCP(Model Context Protocol) 서버입니다.

## 기능

- PostgreSQL 데이터베이스 연결 및 쿼리 실행
- 테이블 구조 및 통계 정보 조회
- 주문 정보 조회 (기본/상세)
- 회원 정보 조회
- 전체 테이블 목록 조회

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 데이터베이스 비밀번호를 설정합니다:

```bash
cp .env.example .env
# .env 파일에서 ECTLOCAL_DB_PASSWORD 설정
```

### 3. 빌드

```bash
npm run build
```

## 사용법

### 개발 모드

```bash
npm run dev
```

### 프로덕션 모드

```bash
npm start
```

## MCP 도구

### 1. execute_query
SQL 쿼리를 직접 실행합니다.

**매개변수:**
- `query` (string): 실행할 SQL 쿼리

**예시:**
```sql
SELECT COUNT(*) FROM orders WHERE order_date >= '2025-01-01'
```

### 2. get_table_structure
테이블의 구조, 인덱스, 통계 정보를 조회합니다.

**매개변수:**
- `table_name` (string): 조회할 테이블 이름

**예시:**
```
table_name: orders
```

### 3. list_tables
ec_ectlocal 스키마의 모든 테이블 목록을 조회합니다.

**매개변수:** 없음

### 4. get_order
특정 주문 ID로 주문 정보를 조회합니다.

**매개변수:**
- `order_id` (string): 조회할 주문 ID

**예시:**
```
order_id: 20250804-0000020
```

### 5. get_order_detail
주문 상세 정보를 order_manage 테이블과 함께 조회합니다.

**매개변수:**
- `order_id` (string): 조회할 주문 ID

### 6. get_member
회원 ID로 회원 정보를 조회합니다.

**매개변수:**
- `member_id` (string): 조회할 회원 ID

**예시:**
```
member_id: ectlocal
```

## Claude Desktop 설정

Claude Desktop에서 이 MCP 서버를 사용하려면 설정 파일에 다음을 추가하세요:

### 옵션 1: .env 파일 자동 로딩 (권장)
MCP 서버가 프로젝트 루트의 `.env` 파일을 자동으로 찾아 로딩합니다.

**macOS** - `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ectlocal-connect": {
      "command": "node",
      "args": ["/Users/wjsong/Workspace/MCP/ectlocal-connect/dist/index.js"]
    }
  }
}
```

**Windows** - `%APPDATA%/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ectlocal-connect": {
      "command": "node",
      "args": ["C:\\Users\\wjsong\\Workspace\\MCP\\ectlocal-connect\\dist\\index.js"]
    }
  }
}
```

### 옵션 2: 환경변수 직접 설정
Claude Desktop 설정에서 직접 환경변수를 설정합니다.

**macOS**:

```json
{
  "mcpServers": {
    "ectlocal-connect": {
      "command": "node",
      "args": ["/Users/wjsong/Workspace/MCP/ectlocal-connect/dist/index.js"]
    }
  }
}
```

## 데이터베이스 정보

- **Host**: your_db_host
- **Port**: your_db_pord
- **Database**: your_database
- **Schema**: your_schema
- **User**: db_user

### 주요 테이블

- `orders`: 주문 정보
- `order_manage`: 주문 관리 정보
- `member`: 회원 정보

## 개발

### 스크립트

- `npm run build`: TypeScript 컴파일
- `npm run dev`: 개발 모드 실행
- `npm start`: 프로덕션 모드 실행

### 의존성

- `@modelcontextprotocol/sdk`: MCP SDK
- `pg`: PostgreSQL 클라이언트
- `dotenv`: 환경 변수 관리
- `typescript`: TypeScript 컴파일러
- `tsx`: TypeScript 실행기

## 라이선스

MIT

## MCP 서버 실행 방법
```bash
npm install && npm run build && npm start
```