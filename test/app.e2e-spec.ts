import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Finance Backend (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let accountId: string;
  let categoryId: string;
  let transactionId: string;

  // Use unique email for each test run
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same config as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/ (GET) - should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Authentication Flow', () => {
    describe('POST /auth/register', () => {
      it('should register a new user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            name: 'Test User',
            email: testEmail,
            password: testPassword,
          })
          .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(testEmail);
        expect(response.body.user).not.toHaveProperty('password');

        authToken = response.body.token;
        userId = response.body.user.id;
      });

      it('should reject duplicate email registration', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            name: 'Another User',
            email: testEmail, // Same email
            password: testPassword,
          })
          .expect(409);
      });

      it('should reject registration with short password', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            name: 'Short Pass User',
            email: `short-${Date.now()}@example.com`,
            password: '12345', // Less than 6 chars
          })
          .expect(400);
      });

      it('should reject registration with invalid email', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            name: 'Invalid Email User',
            email: 'not-an-email',
            password: testPassword,
          })
          .expect(400);
      });

      it('should reject registration without name', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `no-name-${Date.now()}@example.com`,
            password: testPassword,
          })
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testEmail,
            password: testPassword,
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(testEmail);
      });

      it('should reject login with wrong password', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testEmail,
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('should reject login with non-existent email', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: testPassword,
          })
          .expect(401);
      });
    });

    describe('GET /auth/me', () => {
      it('should return current user info with valid token', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.email).toBe(testEmail);
        expect(response.body.id).toBe(userId);
      });

      it('should reject request without token', async () => {
        await request(app.getHttpServer()).get('/auth/me').expect(401);
      });

      it('should reject request with invalid token', async () => {
        await request(app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });
  });

  describe('Accounts CRUD', () => {
    describe('POST /accounts', () => {
      it('should create a new account', async () => {
        const response = await request(app.getHttpServer())
          .post('/accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Wallet',
            type: 'CASH',
            balance: 1000,
            currency: 'COP',
          })
          .expect(201);

        expect(response.body.name).toBe('Test Wallet');
        expect(response.body.type).toBe('CASH');
        expect(parseFloat(response.body.balance)).toBe(1000);
        accountId = response.body.id;
      });

      it('should reject account creation without auth', async () => {
        await request(app.getHttpServer())
          .post('/accounts')
          .send({
            name: 'Unauthorized Account',
            type: 'CASH',
          })
          .expect(401);
      });

      it('should reject account without required fields', async () => {
        await request(app.getHttpServer())
          .post('/accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            balance: 1000,
          })
          .expect(400);
      });
    });

    describe('GET /accounts', () => {
      it('should list user accounts', async () => {
        const response = await request(app.getHttpServer())
          .get('/accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    describe('GET /accounts/:id', () => {
      it('should get specific account', async () => {
        const response = await request(app.getHttpServer())
          .get(`/accounts/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.id).toBe(accountId);
      });

      it('should return 404 for non-existent account', async () => {
        await request(app.getHttpServer())
          .get('/accounts/550e8400-e29b-41d4-a716-446655440000')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('PATCH /accounts/:id', () => {
      it('should update account', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/accounts/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Updated Wallet',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated Wallet');
      });
    });
  });

  describe('Categories CRUD', () => {
    describe('POST /categories', () => {
      it('should create an EXPENSE category', async () => {
        const response = await request(app.getHttpServer())
          .post('/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Food',
            transactionType: 'EXPENSE',
            icon: 'food',
            color: '#FF5733',
          })
          .expect(201);

        expect(response.body.name).toBe('Food');
        expect(response.body.transactionType).toBe('EXPENSE');
        categoryId = response.body.id;
      });

      it('should create an INCOME category', async () => {
        const response = await request(app.getHttpServer())
          .post('/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Salary',
            transactionType: 'INCOME',
          })
          .expect(201);

        expect(response.body.transactionType).toBe('INCOME');
      });

      it('should reject invalid transactionType', async () => {
        await request(app.getHttpServer())
          .post('/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Invalid',
            transactionType: 'INVALID',
          })
          .expect(400);
      });
    });

    describe('GET /categories', () => {
      it('should list user categories', async () => {
        const response = await request(app.getHttpServer())
          .get('/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Transactions CRUD', () => {
    describe('POST /transactions', () => {
      it('should create an EXPENSE transaction', async () => {
        const response = await request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'EXPENSE',
            amount: 50,
            accountId: accountId,
            categoryId: categoryId,
            description: 'Lunch',
            date: new Date().toISOString(),
          })
          .expect(201);

        expect(response.body.type).toBe('EXPENSE');
        expect(parseFloat(response.body.amount)).toBe(50);
        transactionId = response.body.id;
      });

      it('should update account balance after EXPENSE', async () => {
        const response = await request(app.getHttpServer())
          .get(`/accounts/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Initial was 1000, expense was 50
        expect(parseFloat(response.body.balance)).toBe(950);
      });

      it('should create an INCOME transaction', async () => {
        // First get an income category
        const categoriesResponse = await request(app.getHttpServer())
          .get('/categories')
          .set('Authorization', `Bearer ${authToken}`);

        const incomeCategory = categoriesResponse.body.find(
          (c: any) => c.transactionType === 'INCOME',
        );

        const response = await request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'INCOME',
            amount: 200,
            accountId: accountId,
            categoryId: incomeCategory.id,
            description: 'Bonus',
          })
          .expect(201);

        expect(response.body.type).toBe('INCOME');
      });

      it('should update account balance after INCOME', async () => {
        const response = await request(app.getHttpServer())
          .get(`/accounts/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Was 950, income was 200
        expect(parseFloat(response.body.balance)).toBe(1150);
      });

      it('should reject expense with insufficient balance', async () => {
        await request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'EXPENSE',
            amount: 100000, // More than balance
            accountId: accountId,
            categoryId: categoryId,
          })
          .expect(400);
      });

      it('should reject transaction without required fields', async () => {
        await request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'EXPENSE',
            amount: 50,
            // Missing accountId and categoryId
          })
          .expect(400);
      });

      it('should reject TRANSFER without source/destination', async () => {
        await request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'TRANSFER',
            amount: 100,
            // Missing sourceAccountId and destinationAccountId
          })
          .expect(400);
      });
    });

    describe('GET /transactions', () => {
      it('should list user transactions', async () => {
        const response = await request(app.getHttpServer())
          .get('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('should filter by type', async () => {
        const response = await request(app.getHttpServer())
          .get('/transactions?type=EXPENSE')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        response.body.forEach((tx: any) => {
          expect(tx.type).toBe('EXPENSE');
        });
      });

      it('should filter by accountId', async () => {
        const response = await request(app.getHttpServer())
          .get(`/transactions?accountId=${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        response.body.forEach((tx: any) => {
          expect(tx.accountId).toBe(accountId);
        });
      });
    });

    describe('GET /transactions/:id', () => {
      it('should get specific transaction with relations', async () => {
        const response = await request(app.getHttpServer())
          .get(`/transactions/${transactionId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.id).toBe(transactionId);
      });
    });

    describe('PATCH /transactions/:id', () => {
      it('should update transaction description', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/transactions/${transactionId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: 'Updated lunch description',
          })
          .expect(200);

        expect(response.body.description).toBe('Updated lunch description');
      });
    });
  });

  describe('Transfer Transactions', () => {
    let secondAccountId: string;

    beforeAll(async () => {
      // Create a second account for transfers
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Savings Account',
          type: 'BANK',
          balance: 500,
        })
        .expect(201);

      secondAccountId = response.body.id;
    });

    it('should create a TRANSFER transaction', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'TRANSFER',
          amount: 100,
          sourceAccountId: accountId,
          destinationAccountId: secondAccountId,
          description: 'Transfer to savings',
        })
        .expect(201);

      expect(response.body.type).toBe('TRANSFER');
    });

    it('should update both account balances after transfer', async () => {
      const sourceResponse = await request(app.getHttpServer())
        .get(`/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const destResponse = await request(app.getHttpServer())
        .get(`/accounts/${secondAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Source was 1150, transfer was 100 -> 1050
      expect(parseFloat(sourceResponse.body.balance)).toBe(1050);
      // Destination was 500, transfer was 100 -> 600
      expect(parseFloat(destResponse.body.balance)).toBe(600);
    });
  });

  describe('Authorization Tests', () => {
    it('should reject all protected endpoints without token', async () => {
      await request(app.getHttpServer()).get('/accounts').expect(401);
      await request(app.getHttpServer()).get('/categories').expect(401);
      await request(app.getHttpServer()).get('/transactions').expect(401);
    });

    it('should reject with malformed Bearer token', async () => {
      await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', 'Bearer')
        .expect(401);
    });

    it('should reject with Basic auth instead of Bearer', async () => {
      await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', 'Basic dGVzdDp0ZXN0')
        .expect(401);
    });
  });

  describe('Cleanup', () => {
    describe('DELETE /transactions/:id', () => {
      it('should delete a transaction', async () => {
        await request(app.getHttpServer())
          .delete(`/transactions/${transactionId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });
    });

    describe('DELETE /categories/:id', () => {
      it('should delete a category', async () => {
        await request(app.getHttpServer())
          .delete(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });
    });

    describe('DELETE /accounts/:id', () => {
      it('should delete an account', async () => {
        await request(app.getHttpServer())
          .delete(`/accounts/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });
    });
  });
});
