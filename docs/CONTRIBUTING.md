# Contributing Guide

Thank you for your interest in contributing to the Finance Backend! This guide will help you get started with development.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Git Workflow](#git-workflow)
- [Creating Features](#creating-features)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Development Setup

### Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher
- **Docker Desktop** (for PostgreSQL)
- **Git**
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd finance-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=finance_db
JWT_SECRET=your_super_secret_key_at_least_32_characters
NODE_ENV=development
PORT=3000
```

4. **Start the database**

```bash
docker compose up -d
```

5. **Run the application**

```bash
npm run start:dev
```

6. **Verify setup**

- Application: http://localhost:3000
- API Docs: http://localhost:3000/api
- Test endpoint: `curl http://localhost:3000`

### VS Code Extensions (Recommended)

```json
{
    "recommendations": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-tslint-plugin",
        "prisma.prisma"
    ]
}
```

## Project Structure

```
src/
├── auth/                       # Authentication module
│   ├── auth.controller.ts      # Auth endpoints
│   ├── auth.module.ts          # Module definition
│   ├── auth.service.ts         # Auth business logic
│   ├── decorators/             # @CurrentUser decorator
│   ├── dto/                    # LoginDto, RegisterDto
│   └── guards/                 # AuthGuard (JWT)
│
├── users/                      # Users module
│   ├── users.controller.ts     # User CRUD endpoints
│   ├── users.module.ts         # Module definition
│   ├── users.service.ts        # User business logic
│   ├── dto/                    # User DTOs
│   └── entities/               # User entity
│
├── accounts/                   # Accounts module
│   ├── accounts.controller.ts
│   ├── accounts.module.ts
│   ├── accounts.service.ts
│   ├── dto/
│   └── entities/
│
├── categories/                 # Categories module
│   ├── categories.controller.ts
│   ├── categories.module.ts
│   ├── categories.service.ts
│   ├── dto/
│   └── entities/
│
├── transactions/               # Transactions module
│   ├── transactions.controller.ts
│   ├── transactions.module.ts
│   ├── transactions.service.ts
│   ├── domain/                 # Business logic
│   │   └── income-expense/     # Domain rules
│   ├── dto/
│   └── entities/
│
├── app.controller.ts           # Root controller
├── app.module.ts               # Root module
├── app.service.ts              # Root service
└── main.ts                     # Application entry
```

## Code Style

### General Guidelines

- Use **TypeScript** for all source files
- Follow **NestJS conventions** for module structure
- Use **class-validator** decorators for DTO validation
- Document endpoints with **Swagger** decorators

### TypeScript

```typescript
// Use interfaces for type definitions
interface UserPayload {
    userId: string;
    email: string;
}

// Use enums for fixed values
enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    TRANSFER = 'TRANSFER',
}

// Use descriptive variable names
const hasInsufficientBalance = currentBalance < transactionAmount;
```

### Controllers

```typescript
@ApiTags('resource-name')        // Swagger tag
@Controller('resource-name')      // Route prefix
@UseGuards(AuthGuard)            // If protected
@ApiBearerAuth()                 // If authenticated
export class ResourceController {
    constructor(private readonly service: ResourceService) {}

    @Post()
    @ApiOperation({ summary: 'Short description' })
    @ApiResponse({ status: 201, description: 'Success message' })
    @ApiResponse({ status: 400, description: 'Error message' })
    create(@Body() dto: CreateResourceDto) {
        return this.service.create(dto);
    }
}
```

### Services

```typescript
@Injectable()
export class ResourceService {
    constructor(
        @InjectRepository(Resource)
        private readonly repository: Repository<Resource>,
    ) {}

    async create(dto: CreateResourceDto): Promise<Resource> {
        const entity = this.repository.create(dto);
        return this.repository.save(entity);
    }
}
```

### DTOs

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
    @ApiProperty({ example: 'Example', description: 'Field description' })
    @IsString()
    @IsNotEmpty()
    requiredField: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    optionalField?: string;
}
```

### Entities

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('table_name')
export class Resource {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ name: 'user_id' })
    userId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
```

### Linting & Formatting

```bash
# Lint and auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Git Workflow

We follow a simplified Gitflow strategy.

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `hotfix/*` | Production fixes |

### Branch Naming

```
feature/add-user-authentication
feature/transaction-filters
fix/balance-calculation-error
hotfix/security-vulnerability
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code change that neither fixes nor adds
- `test`: Adding or correcting tests
- `chore`: Maintenance, dependencies

**Examples:**

```bash
feat(auth): add JWT authentication
fix(transactions): correct balance calculation
docs(readme): update installation instructions
refactor(accounts): extract validation logic
test(users): add unit tests for user service
chore(deps): update NestJS to v11
```

### Workflow Example

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-endpoint

# 3. Make changes and commit
git add .
git commit -m "feat(module): add new endpoint"

# 4. Push and create PR
git push origin feature/new-endpoint
```

## Creating Features

### 1. Generate Module

```bash
# Generate complete module
nest generate module module-name
nest generate controller module-name
nest generate service module-name
```

### 2. Create Entity

```typescript
// src/module-name/entities/entity.entity.ts
@Entity('table_name')
export class Entity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    // ... columns
}
```

### 3. Create DTOs

```typescript
// src/module-name/dto/create-entity.dto.ts
export class CreateEntityDto {
    @IsString()
    @IsNotEmpty()
    field: string;
}

// src/module-name/dto/update-entity.dto.ts
export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

### 4. Implement Service

```typescript
@Injectable()
export class EntityService {
    constructor(
        @InjectRepository(Entity)
        private readonly repository: Repository<Entity>,
    ) {}
    
    // CRUD methods
}
```

### 5. Implement Controller

```typescript
@ApiTags('entities')
@Controller('entities')
export class EntityController {
    constructor(private readonly service: EntityService) {}
    
    // Endpoints with Swagger decorators
}
```

### 6. Register in Module

```typescript
@Module({
    imports: [TypeOrmModule.forFeature([Entity])],
    controllers: [EntityController],
    providers: [EntityService],
    exports: [EntityService],
})
export class EntityModule {}
```

### 7. Import in AppModule

```typescript
@Module({
    imports: [
        // ... other imports
        EntityModule,
    ],
})
export class AppModule {}
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test File Structure

```
src/
├── module/
│   ├── module.service.ts
│   ├── module.service.spec.ts    # Unit tests
│   ├── module.controller.ts
│   └── module.controller.spec.ts # Controller tests
test/
└── app.e2e-spec.ts               # E2E tests
```

### Unit Test Example

```typescript
describe('AccountsService', () => {
    let service: AccountsService;
    let repository: Repository<Account>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AccountsService,
                {
                    provide: getRepositoryToken(Account),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AccountsService>(AccountsService);
        repository = module.get<Repository<Account>>(getRepositoryToken(Account));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return array of accounts', async () => {
            const mockAccounts = [{ id: '1', name: 'Test' }];
            jest.spyOn(repository, 'find').mockResolvedValue(mockAccounts as any);
            
            const result = await service.findAll();
            
            expect(result).toEqual(mockAccounts);
        });
    });
});
```

## Pull Request Process

### Before Submitting

1. **Update from develop**
   ```bash
   git checkout develop
   git pull
   git checkout your-branch
   git rebase develop
   ```

2. **Run checks**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Swagger annotations added
```

### Review Process

1. Create PR against `develop` branch
2. Request review from maintainers
3. Address feedback
4. Squash and merge when approved

## Questions?

If you have questions, please:

1. Check existing documentation
2. Search closed issues/PRs
3. Open a new issue with `[Question]` prefix

Thank you for contributing!

