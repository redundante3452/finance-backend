# Database Documentation

This document describes the database schema, entity relationships, and data model for the Finance Backend.

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
  - [users](#users)
  - [accounts](#accounts)
  - [categories](#categories)
  - [transactions](#transactions)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Data Types](#data-types)

## Overview

The database uses **PostgreSQL** with **TypeORM** as the ORM. All tables use UUID primary keys and include automatic timestamps for auditing.

### Key Design Decisions

- **UUID Primary Keys**: All entities use UUID v4 for primary keys
- **Soft References**: Transactions reference accounts/categories with SET NULL on delete
- **Cascade Deletes**: User deletion cascades to all related entities
- **Automatic Timestamps**: `created_at` and `updated_at` managed by TypeORM

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIPS                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    USERS     │
├──────────────┤
│ PK id        │
│    name      │
│    email     │◄──────────────────────────────────────────────────────┐
│    password  │                                                       │
│    created_at│                                                       │
│    updated_at│                                                       │
└──────┬───────┘                                                       │
       │                                                               │
       │ 1:N                                                           │
       │                                                               │
       ▼                                                               │
┌──────────────┐         ┌──────────────┐         ┌──────────────────┐ │
│   ACCOUNTS   │         │  CATEGORIES  │         │   TRANSACTIONS   │ │
├──────────────┤         ├──────────────┤         ├──────────────────┤ │
│ PK id        │         │ PK id        │         │ PK id            │ │
│ FK user_id ──┼────┐    │ FK user_id ──┼────┐    │ FK user_id ──────┼─┘
│    name      │    │    │    name      │    │    │    type          │
│    type      │    │    │    trans_type│    │    │    amount        │
│    balance   │    │    │    icon      │    │    │    date          │
│    currency  │    │    │    color     │    │    │    description   │
│    created_at│    │    │    created_at│    │    │    origin        │
│    updated_at│    │    │    updated_at│    │    │ FK account_id ───┼──┐
└──────────────┘    │    └──────────────┘    │    │ FK category_id ──┼──┼──┐
       ▲            │           ▲            │    │ FK src_acct_id ──┼──┼──┼──┐
       │            │           │            │    │ FK dest_acct_id ─┼──┼──┼──┼─┐
       │            │           │            │    │    created_at    │  │  │  │ │
       │            │           │            │    │    updated_at    │  │  │  │ │
       │            │           │            │    └──────────────────┘  │  │  │ │
       │            │           │            │                          │  │  │ │
       │            │           └────────────┼──────────────────────────┼──┘  │ │
       │            │                        │                          │     │ │
       │            └────────────────────────┼──────────────────────────┘     │ │
       │                                     │                                │ │
       └─────────────────────────────────────┼────────────────────────────────┘ │
                                             │                                  │
                                             └──────────────────────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  1:N = One to Many relationship
  ──► = Foreign Key reference
```

## Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | User's display name |
| email | VARCHAR(150) | NOT NULL, UNIQUE | Login email address |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Notes:**
- Password is hashed with bcrypt (10 salt rounds)
- Password is excluded from default SELECT queries (TypeORM `select: false`)
- Email uniqueness enforced at database level

---

### accounts

Stores financial accounts for each user.

```sql
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50) NOT NULL,
    type            VARCHAR(20) NOT NULL,
    balance         DECIMAL(10,2) DEFAULT 0,
    currency        VARCHAR(3) DEFAULT 'COP',
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(50) | NOT NULL | Account name |
| type | VARCHAR(20) | NOT NULL | Account type |
| balance | DECIMAL(10,2) | DEFAULT 0 | Current balance |
| currency | VARCHAR(3) | DEFAULT 'COP' | Currency code |
| user_id | UUID | FK, NOT NULL | Owner reference |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Account Types:**
- `CASH` - Physical cash
- `BANK` - Bank account
- `NEQUI` - Nequi digital wallet
- `DAVIPLATA` - Daviplata digital wallet
- Custom types allowed

**Notes:**
- Balance precision: 10 digits total, 2 decimal places
- Cascades on user deletion (all accounts deleted)

---

### categories

Stores transaction categories for organizing finances.

```sql
CREATE TABLE categories (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(255) NOT NULL,
    transaction_type    VARCHAR(20) NOT NULL,
    icon                VARCHAR(255),
    color               VARCHAR(255),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Category name |
| transaction_type | VARCHAR(20) | NOT NULL | INCOME or EXPENSE |
| icon | VARCHAR(255) | NULLABLE | Icon identifier |
| color | VARCHAR(255) | NULLABLE | Hex color code |
| user_id | UUID | FK, NOT NULL | Owner reference |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Transaction Types:**
- `INCOME` - For income transactions
- `EXPENSE` - For expense transactions

---

### transactions

Stores all financial transactions.

```sql
CREATE TABLE transactions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type                    VARCHAR(20) NOT NULL,
    amount                  DECIMAL(10,2) NOT NULL,
    date                    TIMESTAMP NOT NULL,
    description             TEXT,
    origin                  VARCHAR(20) DEFAULT 'MANUAL',
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id              UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id             UUID REFERENCES categories(id) ON DELETE SET NULL,
    source_account_id       UUID REFERENCES accounts(id) ON DELETE SET NULL,
    destination_account_id  UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| type | VARCHAR(20) | NOT NULL | Transaction type |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| date | TIMESTAMP | NOT NULL | Transaction date |
| description | TEXT | NULLABLE | Description/notes |
| origin | VARCHAR(20) | DEFAULT 'MANUAL' | How it was created |
| user_id | UUID | FK, NOT NULL | Owner reference |
| account_id | UUID | FK, NULLABLE | For income/expense |
| category_id | UUID | FK, NULLABLE | Transaction category |
| source_account_id | UUID | FK, NULLABLE | For transfers (from) |
| destination_account_id | UUID | FK, NULLABLE | For transfers (to) |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Transaction Types:**
- `INCOME` - Money coming in (requires account_id, category_id)
- `EXPENSE` - Money going out (requires account_id, category_id)
- `TRANSFER` - Between accounts (requires source_account_id, destination_account_id)

**Origin Types:**
- `MANUAL` - User-created transaction
- `RECEIPT_AI` - Created from receipt scan (future feature)
- `IMPORT` - Imported from external source (future feature)

**Notes:**
- Account/category references use SET NULL on delete (preserve transaction history)
- User reference cascades (delete user = delete all transactions)

## Relationships

### One-to-Many Relationships

```
User (1) ──────► (N) Account
     Each user can have multiple accounts

User (1) ──────► (N) Category
     Each user can have multiple categories

User (1) ──────► (N) Transaction
     Each user can have multiple transactions
```

### Many-to-One Relationships

```
Transaction (N) ──────► (1) Account
     Multiple transactions can reference the same account

Transaction (N) ──────► (1) Category
     Multiple transactions can use the same category

Account (N) ──────► (1) User
     Multiple accounts belong to one user
```

### Relationship Summary Table

| Parent | Child | Relationship | On Delete |
|--------|-------|--------------|-----------|
| users | accounts | 1:N | CASCADE |
| users | categories | 1:N | CASCADE |
| users | transactions | 1:N | CASCADE |
| accounts | transactions (account_id) | 1:N | SET NULL |
| accounts | transactions (source_account_id) | 1:N | SET NULL |
| accounts | transactions (destination_account_id) | 1:N | SET NULL |
| categories | transactions | 1:N | SET NULL |

## Indexes

### Automatic Indexes

TypeORM creates indexes for:
- Primary keys (all `id` columns)
- Unique constraints (`users.email`)
- Foreign keys (all `*_id` columns)

### Recommended Additional Indexes

```sql
-- For filtering transactions by date range
CREATE INDEX idx_transactions_date ON transactions(date);

-- For filtering transactions by type
CREATE INDEX idx_transactions_type ON transactions(type);

-- For filtering by user and date (common query pattern)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- For category lookups by type
CREATE INDEX idx_categories_transaction_type ON categories(transaction_type);
```

## Data Types

### UUID Generation

All primary keys use UUID v4:

```typescript
@PrimaryGeneratedColumn('uuid')
id: string;
```

### Decimal Precision

Financial amounts use DECIMAL(10,2):
- Maximum: 99,999,999.99
- Minimum: -99,999,999.99
- Precision: 2 decimal places

```typescript
@Column('decimal', { precision: 10, scale: 2 })
amount: number;
```

### Timestamps

All tables include automatic timestamps:

```typescript
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;
```

### String Lengths

| Field | Max Length | Reason |
|-------|------------|--------|
| user.name | 100 | Display names |
| user.email | 150 | Email addresses |
| account.name | 50 | Short account names |
| account.type | 20 | Type codes |
| account.currency | 3 | ISO currency codes |
| transaction.type | 20 | Type codes |
| transaction.origin | 20 | Origin codes |
| category.transaction_type | 20 | INCOME/EXPENSE |

## TypeORM Entity Configuration

### Cascade Configuration

```typescript
// User -> Accounts (cascade delete)
@ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
user: User;

// Transaction -> Account (set null on delete)
@ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
account: Account;
```

### Column Naming Strategy

TypeORM converts camelCase to snake_case:

| TypeScript | PostgreSQL |
|------------|------------|
| userId | user_id |
| createdAt | created_at |
| transactionType | transaction_type |
| sourceAccountId | source_account_id |

Explicit column names used for clarity:

```typescript
@Column({ name: 'user_id' })
userId: string;

@JoinColumn({ name: 'user_id' })
user: User;
```

## Database Configuration

### Development

```typescript
{
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'finance_db',
    synchronize: true  // Auto-sync schema
}
```

### Production

```typescript
{
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    synchronize: true  // Consider false with migrations
}
```

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: finance_db
    ports:
      - "5432:5432"
```

