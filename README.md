# Finance Backend API

A robust and scalable backend for personal finance management built with **NestJS**, **TypeORM**, and **PostgreSQL**. This project demonstrates **Clean Architecture**, **Domain-Driven Design**, and professional development practices.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FINANCE BACKEND API                         │
├─────────────────────────────────────────────────────────────────┤
│  Auth  │  Users  │  Accounts  │  Categories  │  Transactions   │
├─────────────────────────────────────────────────────────────────┤
│                      Domain Layer                               │
│         (Business Rules, Validators, Balance Logic)             │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                         │
│              (TypeORM, PostgreSQL, JWT)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **User Authentication** - JWT-based authentication with secure password hashing (bcrypt)
- **Multi-Account Management** - Track multiple accounts (Cash, Bank, Digital Wallets)
- **Transaction Tracking** - Record income, expenses, and transfers between accounts
- **Category Management** - Organize transactions with custom categories
- **Balance Automation** - Automatic balance updates on transactions
- **Transfer Support** - Move money between accounts with balance validation
- **API Documentation** - Interactive Swagger/OpenAPI documentation
- **Input Validation** - Request validation with class-validator
- **Multi-Currency Support** - Default COP with extensible currency support

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | NestJS | ^11.0.1 |
| Language | TypeScript | ^5.7.3 |
| Database | PostgreSQL | 14+ |
| ORM | TypeORM | ^0.3.27 |
| Authentication | JWT (Passport) | ^11.0.1 |
| Validation | class-validator | ^0.14.2 |
| Documentation | Swagger | ^11.2.3 |
| Containerization | Docker | 3.8+ |

## Quick Start

### Prerequisites

- Node.js v16 or higher
- Docker Desktop (for database)
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd finance-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_NAME` | Database name | finance_db |
| `JWT_SECRET` | JWT signing key (min 32 chars) | - |
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `FRONTEND_URL` | Allowed CORS origin | * |

### 3. Start Database

```bash
docker compose up -d
```

### 4. Run Application

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 5. Access API

- **Application**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get current user info |

### Accounts (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | List user accounts |
| POST | `/accounts` | Create account |
| GET | `/accounts/:id` | Get account by ID |
| PATCH | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |

### Categories (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List user categories |
| POST | `/categories` | Create category |
| GET | `/categories/:id` | Get category by ID |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Transactions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List transactions (with filters) |
| POST | `/transactions` | Create transaction |
| GET | `/transactions/:id` | Get transaction by ID |
| PATCH | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |

> All protected endpoints require `Authorization: Bearer <token>` header

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/          # Custom decorators (@CurrentUser)
│   ├── dto/                 # Login/Register DTOs
│   └── guards/              # JWT Auth Guard
├── users/                   # User management
│   ├── dto/                 # User DTOs
│   └── entities/            # User entity
├── accounts/                # Financial accounts
│   ├── dto/                 # Account DTOs
│   └── entities/            # Account entity
├── categories/              # Transaction categories
│   ├── dto/                 # Category DTOs
│   └── entities/            # Category entity
├── transactions/            # Transaction management
│   ├── domain/              # Business logic
│   │   └── income-expense/  # Domain rules
│   ├── dto/                 # Transaction DTOs
│   └── entities/            # Transaction entity
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and patterns |
| [API Reference](docs/API.md) | Complete endpoint documentation |
| [Database Schema](docs/DATABASE.md) | Entity relationships and schema |
| [Contributing](docs/CONTRIBUTING.md) | Development guidelines |
| [Deployment](DEPLOY.md) | Production deployment guide |
| [Git Workflow](GIT_WORKFLOW.md) | Branch strategy and commits |

## Scripts

```bash
npm run start:dev     # Development with hot reload
npm run start:prod    # Production mode
npm run build         # Build for production
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run lint          # Lint and fix code
npm run format        # Format code with Prettier
```

## License

This project is open source and available under the MIT License.
