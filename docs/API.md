# API Reference

Complete API documentation for the Finance Backend. All endpoints return JSON responses.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Responses](#error-responses)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Users](#users)
  - [Accounts](#accounts)
  - [Categories](#categories)
  - [Transactions](#transactions)

## Base URL

```
Development: http://localhost:3000
Production:  https://your-domain.vercel.app
```

Interactive API documentation (Swagger) available at `/api`

## Authentication

Protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Obtain a token via `/auth/login` or `/auth/register`.

### Token Payload

```json
{
    "userId": "uuid",
    "email": "user@example.com",
    "iat": 1699999999,
    "exp": 1700099999
}
```

## Error Responses

### Standard Error Format

```json
{
    "statusCode": 400,
    "message": "Error description",
    "error": "Bad Request"
}
```

### Validation Error Format

```json
{
    "statusCode": 400,
    "message": [
        "email must be an email",
        "password must be longer than or equal to 6 characters"
    ],
    "error": "Bad Request"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

---

## Endpoints

## Auth

### POST /auth/register

Register a new user account.

**Request Body**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Not empty |
| email | string | Yes | Valid email format |
| password | string | Yes | Minimum 6 characters |

**Response (201 Created)**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

**Errors**

| Code | Message |
|------|---------|
| 409 | Email already registered |

---

### POST /auth/login

Authenticate and receive a JWT token.

**Request Body**

```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200 OK)**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

**Errors**

| Code | Message |
|------|---------|
| 401 | Invalid credentials |

---

### GET /auth/me

Get current authenticated user information.

**Headers**

```
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors**

| Code | Message |
|------|---------|
| 401 | Unauthorized |

---

## Users

### POST /users

Create a new user (admin operation).

**Request Body**

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
}
```

**Response (201 Created)**

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /users

List all users (admin operation).

**Response (200 OK)**

```json
[
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
    }
]
```

---

### GET /users/:id

Get a specific user by ID.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | User ID |

**Response (200 OK)**

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### PATCH /users/:id

Update user information.

**Request Body** (all fields optional)

```json
{
    "name": "John Updated"
}
```

**Response (200 OK)**

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Updated",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### PATCH /users/:id/password

Change user password.

**Request Body**

```json
{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456"
}
```

**Response (200 OK)**

```json
{
    "message": "Password updated successfully"
}
```

**Errors**

| Code | Message |
|------|---------|
| 400 | Current password is incorrect |
| 404 | User not found |

---

### DELETE /users/:id

Delete a user.

**Response (200 OK)**

```json
{
    "deleted": true
}
```

---

## Accounts

> All account endpoints require authentication

### POST /accounts

Create a new financial account.

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
    "name": "Main Wallet",
    "type": "CASH",
    "balance": 1000.00,
    "currency": "COP"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Yes | - | Account name (max 50 chars) |
| type | string | Yes | - | Account type (CASH, BANK, NEQUI, etc.) |
| balance | number | No | 0 | Initial balance |
| currency | string | No | COP | Currency code (3 chars) |

**Response (201 Created)**

```json
{
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Main Wallet",
    "type": "CASH",
    "balance": "1000.00",
    "currency": "COP",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /accounts

List all accounts for the authenticated user.

**Headers**

```
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
[
    {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "Main Wallet",
        "type": "CASH",
        "balance": "1000.00",
        "currency": "COP",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Bank Account",
        "type": "BANK",
        "balance": "5000.00",
        "currency": "COP",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T10:35:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
    }
]
```

---

### GET /accounts/:id

Get a specific account by ID.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Account ID |

**Response (200 OK)**

```json
{
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Main Wallet",
    "type": "CASH",
    "balance": "1000.00",
    "currency": "COP",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors**

| Code | Message |
|------|---------|
| 404 | Account not found |

---

### PATCH /accounts/:id

Update an account.

**Request Body** (all fields optional)

```json
{
    "name": "Updated Wallet Name",
    "type": "DIGITAL"
}
```

**Response (200 OK)**

Returns updated account object.

---

### DELETE /accounts/:id

Delete an account.

**Response (200 OK)**

```json
{
    "deleted": true
}
```

**Errors**

| Code | Message |
|------|---------|
| 403 | Account does not belong to user |
| 404 | Account not found |

---

## Categories

> All category endpoints require authentication

### POST /categories

Create a new transaction category.

**Headers**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
    "name": "Food",
    "transactionType": "EXPENSE",
    "icon": "fast-food",
    "color": "#FF5733"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| transactionType | enum | Yes | INCOME or EXPENSE |
| icon | string | No | Icon identifier |
| color | string | No | Hex color code |

**Response (201 Created)**

```json
{
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Food",
    "transactionType": "EXPENSE",
    "icon": "fast-food",
    "color": "#FF5733",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /categories

List all categories for the authenticated user.

**Response (200 OK)**

```json
[
    {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Food",
        "transactionType": "EXPENSE",
        "icon": "fast-food",
        "color": "#FF5733",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Salary",
        "transactionType": "INCOME",
        "icon": "wallet",
        "color": "#28A745",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T10:35:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
    }
]
```

---

### GET /categories/:id

Get a specific category by ID.

**Response (200 OK)**

Returns category object.

**Errors**

| Code | Message |
|------|---------|
| 404 | Category not found |

---

### PATCH /categories/:id

Update a category.

**Request Body** (all fields optional)

```json
{
    "name": "Groceries",
    "color": "#FF0000"
}
```

**Response (200 OK)**

Returns updated category object.

---

### DELETE /categories/:id

Delete a category.

**Response (200 OK)**

```json
{
    "deleted": true
}
```

---

## Transactions

> All transaction endpoints require authentication

### POST /transactions

Create a new transaction.

**Headers**

```
Authorization: Bearer <token>
```

#### Income/Expense Transaction

```json
{
    "type": "EXPENSE",
    "amount": 50000,
    "accountId": "660e8400-e29b-41d4-a716-446655440000",
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "description": "Lunch at restaurant",
    "date": "2024-01-15T12:00:00.000Z"
}
```

#### Transfer Transaction

```json
{
    "type": "TRANSFER",
    "amount": 100000,
    "sourceAccountId": "660e8400-e29b-41d4-a716-446655440000",
    "destinationAccountId": "660e8400-e29b-41d4-a716-446655440001",
    "description": "Transfer to savings",
    "date": "2024-01-15T12:00:00.000Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | Yes | INCOME, EXPENSE, or TRANSFER |
| amount | number | Yes | Amount (min 0.01) |
| accountId | UUID | * | Required for INCOME/EXPENSE |
| categoryId | UUID | * | Required for INCOME/EXPENSE |
| sourceAccountId | UUID | ** | Required for TRANSFER |
| destinationAccountId | UUID | ** | Required for TRANSFER |
| description | string | No | Transaction description |
| date | string | No | ISO date string |

**Response (201 Created)**

```json
{
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "type": "EXPENSE",
    "amount": "50000.00",
    "accountId": "660e8400-e29b-41d4-a716-446655440000",
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "description": "Lunch at restaurant",
    "date": "2024-01-15T12:00:00.000Z",
    "origin": "MANUAL",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T12:05:00.000Z",
    "updatedAt": "2024-01-15T12:05:00.000Z"
}
```

**Errors**

| Code | Message |
|------|---------|
| 400 | Transaction type must be INCOME or EXPENSE or TRANSFER |
| 400 | Transaction account and category are required |
| 400 | Transaction source and destination accounts are required |
| 400 | Insufficient balance |

---

### GET /transactions

List transactions with optional filters.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | enum | Filter by INCOME, EXPENSE, or TRANSFER |
| startDate | ISO date | Start date filter |
| endDate | ISO date | End date filter |
| accountId | UUID | Filter by account |
| categoryId | UUID | Filter by category |

**Example Requests**

```
GET /transactions
GET /transactions?type=EXPENSE
GET /transactions?startDate=2024-01-01&endDate=2024-01-31
GET /transactions?accountId=660e8400-e29b-41d4-a716-446655440000
GET /transactions?type=INCOME&categoryId=770e8400-e29b-41d4-a716-446655440001
```

**Response (200 OK)**

```json
[
    {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "type": "EXPENSE",
        "amount": "50000.00",
        "accountId": "660e8400-e29b-41d4-a716-446655440000",
        "categoryId": "770e8400-e29b-41d4-a716-446655440000",
        "description": "Lunch at restaurant",
        "date": "2024-01-15T12:00:00.000Z",
        "origin": "MANUAL",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T12:05:00.000Z",
        "updatedAt": "2024-01-15T12:05:00.000Z"
    }
]
```

Results are sorted by date in descending order (newest first).

---

### GET /transactions/:id

Get a specific transaction with related entities.

**Response (200 OK)**

```json
{
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "type": "EXPENSE",
    "amount": "50000.00",
    "description": "Lunch at restaurant",
    "date": "2024-01-15T12:00:00.000Z",
    "origin": "MANUAL",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "accountId": "660e8400-e29b-41d4-a716-446655440000",
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "account": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "Main Wallet",
        "type": "CASH"
    },
    "category": {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Food",
        "transactionType": "EXPENSE"
    },
    "createdAt": "2024-01-15T12:05:00.000Z",
    "updatedAt": "2024-01-15T12:05:00.000Z"
}
```

---

### PATCH /transactions/:id

Update a transaction.

**Request Body** (all fields optional)

```json
{
    "amount": 55000,
    "description": "Updated description"
}
```

> Note: Updating amount will recalculate account balances automatically.

**Response (200 OK)**

Returns updated transaction object.

---

### DELETE /transactions/:id

Delete a transaction.

**Response (200 OK)**

Returns deleted transaction object.

> Note: Deleting a transaction does NOT automatically revert the balance change. This is a known limitation.

---

## Usage Examples

### Complete User Flow

```bash
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'

# Save the token from response
TOKEN="eyJhbGci..."

# 2. Create an account
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cash","type":"CASH","balance":100000}'

# 3. Create a category
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Food","transactionType":"EXPENSE"}'

# 4. Record an expense
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"EXPENSE",
    "amount":25000,
    "accountId":"<account-id>",
    "categoryId":"<category-id>",
    "description":"Lunch"
  }'

# 5. Check updated balance
curl http://localhost:3000/accounts \
  -H "Authorization: Bearer $TOKEN"
```

