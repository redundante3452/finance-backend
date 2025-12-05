# Architecture Documentation

This document describes the architectural design, patterns, and technical decisions of the Finance Backend API.

## Table of Contents

- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Module Structure](#module-structure)
- [Design Patterns](#design-patterns)
- [Authentication Flow](#authentication-flow)
- [Transaction Processing](#transaction-processing)
- [Error Handling](#error-handling)

## Overview

The Finance Backend follows a **modular monolith** architecture built on NestJS, implementing Clean Architecture principles with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                            │
│                    (Controllers, DTOs, Decorators)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                           Application Layer                             │
│                         (Services, Guards)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                            Domain Layer                                 │
│              (Business Rules, Validators, Domain Logic)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                         Infrastructure Layer                            │
│                  (TypeORM Repositories, Database)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer

Handles HTTP requests and responses. Contains:

- **Controllers**: Define API endpoints and route handling
- **DTOs (Data Transfer Objects)**: Validate and shape incoming/outgoing data
- **Decorators**: Custom decorators like `@CurrentUser()` for extracting user info

```typescript
// Example: Controller with DTO validation
@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountsController {
    @Post()
    create(
        @CurrentUser('userId') userId: string,
        @Body() createAccountDto: CreateAccountDto
    ) {
        return this.accountsService.create({ ...createAccountDto, userId });
    }
}
```

### 2. Application Layer

Contains business logic orchestration:

- **Services**: Coordinate between controllers and domain/data layers
- **Guards**: Protect routes (AuthGuard for JWT validation)

```typescript
// Example: Service orchestrating business logic
@Injectable()
export class TransactionsService {
    async createTransaction(dto: CreateTransactionDto, userId: string) {
        // 1. Create entity
        // 2. Validate with domain rules
        // 3. Apply business logic
        // 4. Persist to database
    }
}
```

### 3. Domain Layer

Contains pure business logic without framework dependencies:

- **Validators**: Validate business rules
- **Rules**: Encapsulate domain-specific logic
- Located in `src/transactions/domain/`

```
domain/
└── income-expense/
    ├── transaction.validator.ts   # Type and field validation
    ├── ownership.validator.ts     # User ownership checks
    ├── balance.rules.ts           # Balance modification logic
    ├── income-expense.rules.ts    # Income/Expense processing
    ├── transfer.rules.ts          # Transfer processing
    └── update-transaction.rules.ts # Update logic
```

### 4. Infrastructure Layer

Handles external concerns:

- **Entities**: TypeORM entity definitions
- **Repositories**: Database access (built into TypeORM)
- **Database Configuration**: Connection setup in `app.module.ts`

## Module Structure

Each domain is encapsulated in a NestJS module:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            AppModule                                    │
├──────────┬──────────┬──────────┬─────────────┬───────────────┬─────────┤
│ AuthMod  │ UsersMod │ AcctsMod │ CategorMod  │ TransactMod   │ Config  │
└──────────┴──────────┴──────────┴─────────────┴───────────────┴─────────┘
```

### Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `AuthModule` | JWT authentication, login, registration |
| `UsersModule` | User CRUD operations, password management |
| `AccountsModule` | Financial account management |
| `CategoriesModule` | Transaction category management |
| `TransactionsModule` | Transaction processing with domain rules |

### Module Dependencies

```
AuthModule ──────► UsersModule
                       │
                       ▼
TransactionsModule ──► AccountsModule
         │
         └──────────► CategoriesModule
```

## Design Patterns

### 1. Repository Pattern

TypeORM provides repository abstraction for data access:

```typescript
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    findAll() {
        return this.usersRepository.find();
    }
}
```

### 2. Dependency Injection

NestJS IoC container manages dependencies:

```typescript
@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly accountService: AccountsService,  // Injected
        private readonly categoryService: CategoriesService, // Injected
    ) {}
}
```

### 3. Guard Pattern

Protects routes with authentication/authorization:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = this.extractTokenFromHeader(request);
        const payload = await this.jwtService.verifyAsync(token);
        request['user'] = payload;
        return true;
    }
}
```

### 4. DTO Pattern

Validates and transforms incoming data:

```typescript
export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    balance?: number;
}
```

### 5. Domain Rules Pattern

Encapsulates business logic in dedicated classes:

```typescript
// Balance rules - pure business logic
export class BalanceRules {
    async applyExpense(account, amount: number) {
        if (account.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }
        // Update balance logic
    }
}
```

## Authentication Flow

```
┌──────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│  Client  │────►│ Controller │────►│ AuthService │────►│  Users   │
└──────────┘     └────────────┘     └─────────────┘     └──────────┘
     │                                     │
     │         ┌───────────────┐          │
     │◄────────│  JWT Token    │◄─────────┘
     │         └───────────────┘
     │
     ▼ (subsequent requests)
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐
│  Client  │────►│ AuthGuard │────►│ Controller │────►│ Service  │
│ + Token  │     │ (verify)  │     │            │     │          │
└──────────┘     └───────────┘     └────────────┘     └──────────┘
```

### Authentication Steps

1. **Registration** (`POST /auth/register`)
   - Validate input with RegisterDto
   - Check email uniqueness
   - Hash password with bcrypt (10 rounds)
   - Create user in database
   - Generate and return JWT token

2. **Login** (`POST /auth/login`)
   - Validate credentials
   - Compare password hash
   - Generate and return JWT token

3. **Protected Routes**
   - AuthGuard extracts Bearer token
   - Verify token with JwtService
   - Attach user payload to request
   - @CurrentUser decorator extracts userId

### JWT Payload Structure

```typescript
{
    userId: string,  // User UUID
    email: string,   // User email
    iat: number,     // Issued at
    exp: number      // Expiration
}
```

## Transaction Processing

The transaction system supports three types with automatic balance management:

### Transaction Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `INCOME` | Money coming in | accountId, categoryId |
| `EXPENSE` | Money going out | accountId, categoryId |
| `TRANSFER` | Move between accounts | sourceAccountId, destinationAccountId |

### Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Transaction Creation Flow                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Create Entity ──► 2. Validate Type ──► 3. Validate Ownership        │
│         │                    │                      │                   │
│         ▼                    ▼                      ▼                   │
│  ┌────────────┐      ┌─────────────┐       ┌──────────────┐            │
│  │DTO → Entity│      │ Type Check  │       │ Account/Cat  │            │
│  │            │      │ Required    │       │ belongs to   │            │
│  │            │      │ Fields      │       │ user?        │            │
│  └────────────┘      └─────────────┘       └──────────────┘            │
│                                                   │                     │
│  4. Apply Balance Rules ◄─────────────────────────┘                    │
│         │                                                               │
│         ▼                                                               │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │ INCOME: account.balance += amount                          │        │
│  │ EXPENSE: account.balance -= amount (check sufficient)      │        │
│  │ TRANSFER: source -= amount, destination += amount          │        │
│  └────────────────────────────────────────────────────────────┘        │
│         │                                                               │
│         ▼                                                               │
│  5. Save Transaction                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Domain Classes

```typescript
// 1. TransactionValidator - Validates type and required fields
class TransactionValidator {
    validateTypeAndRequiredFields(transaction: Transaction) {
        // Ensures correct type and required fields present
    }
}

// 2. OwnershipValidator - Verifies user ownership
class OwnershipValidator {
    async validateAccountOwnership(accountId: string, userId: string) {
        // Ensures account belongs to user
    }
}

// 3. BalanceRules - Manages balance updates
class BalanceRules {
    async applyIncome(account, amount) { /* Add to balance */ }
    async applyExpense(account, amount) { /* Subtract from balance */ }
    async applyTransfer(source, dest, amount) { /* Move between accounts */ }
}

// 4. IncomeExpenseRules - Orchestrates income/expense processing
class IncomeExpenseRules {
    async process(transaction, userId) {
        // Validate ownership, apply balance changes
    }
}

// 5. TransferRules - Orchestrates transfer processing
class TransferRules {
    async process(transaction, userId) {
        // Validate both accounts, apply transfer
    }
}
```

## Error Handling

### HTTP Exceptions

The application uses NestJS built-in exceptions:

| Exception | Status Code | Use Case |
|-----------|-------------|----------|
| `BadRequestException` | 400 | Invalid input, insufficient balance |
| `UnauthorizedException` | 401 | Invalid credentials, missing token |
| `ForbiddenException` | 403 | Access denied to resource |
| `NotFoundException` | 404 | Resource not found |
| `ConflictException` | 409 | Duplicate resource (email exists) |

### Validation Pipeline

Global validation pipe configuration:

```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip non-whitelisted properties
    forbidNonWhitelisted: true, // Throw on extra properties
    transform: true,            // Auto-transform types
}));
```

### Error Response Format

```json
{
    "statusCode": 400,
    "message": "Insufficient balance",
    "error": "Bad Request"
}
```

## Configuration

### Environment-Based Configuration

```typescript
// Development: Individual DB credentials
{
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}

// Production: Connection URL
{
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
}
```

### CORS Configuration

```typescript
// Development: Allow all origins
origin: '*'

// Production: Whitelist specific origins
origin: process.env.FRONTEND_URL.split(',')
```

