# Finance Backend API

A robust and modular backend for a personal finance management application. This project serves as a demonstration of **Clean Architecture**, **SOLID principles**, and professional development practices using **NestJS** and **PostgreSQL**.

## Motivation

The primary goal of this project is to provide a reference implementation for modern backend development. It addresses the practical need for managing personal finances (expenses, income, savings goals) while strictly adhering to advanced design patterns such as:

- **Repository Pattern**: Abstraction of the data layer.
- **DTOs (Data Transfer Objects)**: Secure data validation and transfer.
- **Dependency Injection**: Core NestJS feature for loose coupling.
- **Modularity**: Clear separation of domains (Users, Accounts, Transactions).

## Technologies

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger (OpenAPI)
- **Validation**: class-validator

## Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- Docker Desktop (for the database)

## Installation and Execution

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy the example file and adjust it if necessary:
   ```bash
   cp .env.example .env
   ```

4. **Start the database**
   Use Docker Compose to start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```

5. **Run the application**
   ```bash
   npm run start:dev
   ```

The server will be running at `http://localhost:3000`.

## API Documentation

Interactive API documentation (Swagger) is available at:

**http://localhost:3000/api**

You can test all endpoints (Create users, accounts, etc.) directly from the browser.

## Project Structure

The project is organized into modular domains:

- **src/users**: User management and authentication foundation.
- **src/accounts**: Management of financial accounts (Cash, Bank, Digital Wallets).
- **src/categories**: Categorization of financial movements.
- **src/transactions**: Core logic for income, expenses, and transfers.

## License

This project is open source and available under the MIT license.
