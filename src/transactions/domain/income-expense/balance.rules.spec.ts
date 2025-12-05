import { BadRequestException } from '@nestjs/common';
import { BalanceRules } from './balance.rules';
import { AccountsService } from '../../../accounts/accounts.service';

describe('BalanceRules', () => {
  let balanceRules: BalanceRules;
  let mockAccountsService: jest.Mocked<AccountsService>;

  beforeEach(() => {
    mockAccountsService = {
      update: jest.fn(),
    } as any;

    balanceRules = new BalanceRules(mockAccountsService);
  });

  const createMockAccount = (balance: number, id: string = 'account-1') => ({
    id,
    name: 'Test Account',
    type: 'CASH',
    balance,
    currency: 'COP',
    userId: 'user-1',
  });

  describe('applyIncome', () => {
    it('should add amount to account balance', async () => {
      const account = createMockAccount(1000);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1500,
      } as any);

      await balanceRules.applyIncome(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1500,
      });
    });

    it('should handle zero balance account', async () => {
      const account = createMockAccount(0);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 500,
      } as any);

      await balanceRules.applyIncome(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 500,
      });
    });

    it('should handle decimal amounts', async () => {
      const account = createMockAccount(100.5);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 150.75,
      } as any);

      await balanceRules.applyIncome(account, 50.25);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 150.75,
      });
    });

    it('should handle string balance from database', async () => {
      const account = createMockAccount(0);
      (account as any).balance = '1000.00'; // Database returns string
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1500,
      } as any);

      await balanceRules.applyIncome(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1500,
      });
    });

    it('should handle very large amounts', async () => {
      const account = createMockAccount(50000000);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 99999999.99,
      } as any);

      await balanceRules.applyIncome(account, 49999999.99);

      // Use toHaveBeenCalled and check the value separately due to floating point
      expect(mockAccountsService.update).toHaveBeenCalled();
      const [[, updateArg]] = mockAccountsService.update.mock.calls;
      expect(updateArg.balance).toBeCloseTo(99999999.99, 2);
    });
  });

  describe('applyExpense', () => {
    it('should subtract amount from account balance', async () => {
      const account = createMockAccount(1000);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 800,
      } as any);

      await balanceRules.applyExpense(account, 200);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 800,
      });
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      const account = createMockAccount(100);

      await expect(balanceRules.applyExpense(account, 200)).rejects.toThrow(
        BadRequestException,
      );
      await expect(balanceRules.applyExpense(account, 200)).rejects.toThrow(
        'Insufficient balance',
      );
    });

    it('should allow expense equal to balance', async () => {
      const account = createMockAccount(500);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 0,
      } as any);

      await balanceRules.applyExpense(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 0,
      });
    });

    it('should handle decimal amounts', async () => {
      const account = createMockAccount(100.75);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 50.5,
      } as any);

      await balanceRules.applyExpense(account, 50.25);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 50.5,
      });
    });

    it('should handle string balance from database', async () => {
      const account = createMockAccount(0);
      (account as any).balance = '1000.00';
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 800,
      } as any);

      await balanceRules.applyExpense(account, 200);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 800,
      });
    });

    it('should throw for zero balance account', async () => {
      const account = createMockAccount(0);

      await expect(balanceRules.applyExpense(account, 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for expense slightly over balance', async () => {
      const account = createMockAccount(99.99);

      await expect(balanceRules.applyExpense(account, 100)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('applyTransfer', () => {
    it('should transfer amount between accounts', async () => {
      const source = createMockAccount(1000, 'source-1');
      const destination = createMockAccount(500, 'dest-1');

      mockAccountsService.update.mockResolvedValue({} as any);

      const result = await balanceRules.applyTransfer(source, destination, 200);

      expect(result).toEqual({ newSource: 800, newDestination: 700 });
      expect(mockAccountsService.update).toHaveBeenCalledWith('source-1', {
        balance: 800,
      });
      expect(mockAccountsService.update).toHaveBeenCalledWith('dest-1', {
        balance: 700,
      });
    });

    it('should throw BadRequestException when source has insufficient balance', async () => {
      const source = createMockAccount(100, 'source-1');
      const destination = createMockAccount(500, 'dest-1');

      await expect(
        balanceRules.applyTransfer(source, destination, 200),
      ).rejects.toThrow(BadRequestException);
      await expect(
        balanceRules.applyTransfer(source, destination, 200),
      ).rejects.toThrow('Insufficient balance');
    });

    it('should allow transfer equal to source balance', async () => {
      const source = createMockAccount(500, 'source-1');
      const destination = createMockAccount(1000, 'dest-1');

      mockAccountsService.update.mockResolvedValue({} as any);

      const result = await balanceRules.applyTransfer(source, destination, 500);

      expect(result).toEqual({ newSource: 0, newDestination: 1500 });
    });

    it('should handle destination with zero balance', async () => {
      const source = createMockAccount(1000, 'source-1');
      const destination = createMockAccount(0, 'dest-1');

      mockAccountsService.update.mockResolvedValue({} as any);

      const result = await balanceRules.applyTransfer(source, destination, 500);

      expect(result).toEqual({ newSource: 500, newDestination: 500 });
    });

    it('should handle decimal transfer amounts', async () => {
      const source = createMockAccount(100.5, 'source-1');
      const destination = createMockAccount(50.25, 'dest-1');

      mockAccountsService.update.mockResolvedValue({} as any);

      const result = await balanceRules.applyTransfer(
        source,
        destination,
        25.25,
      );

      expect(result.newSource).toBeCloseTo(75.25);
      expect(result.newDestination).toBeCloseTo(75.5);
    });
  });

  describe('revertIncome', () => {
    it('should subtract amount from account balance', async () => {
      const account = createMockAccount(1500);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1000,
      } as any);

      await balanceRules.revertIncome(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1000,
      });
    });

    it('should handle string balance from database', async () => {
      const account = createMockAccount(0);
      (account as any).balance = '1500.00';
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1000,
      } as any);

      await balanceRules.revertIncome(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1000,
      });
    });

    it('should allow resulting negative balance (reverting adds might be needed)', async () => {
      const account = createMockAccount(100);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: -400,
      } as any);

      // Note: This might result in negative balance - potential issue
      await balanceRules.revertIncome(account, 500);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: -400,
      });
    });
  });

  describe('revertExpense', () => {
    it('should add amount back to account balance', async () => {
      const account = createMockAccount(800);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1000,
      } as any);

      await balanceRules.revertExpense(account, 200);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1000,
      });
    });

    it('should handle string balance from database', async () => {
      const account = createMockAccount(0);
      (account as any).balance = '800.00';
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1000,
      } as any);

      await balanceRules.revertExpense(account, 200);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1000,
      });
    });
  });

  describe('revertTransfer', () => {
    it('should reverse transfer between accounts', async () => {
      const source = createMockAccount(800, 'source-1');
      const destination = createMockAccount(700, 'dest-1');

      mockAccountsService.update.mockResolvedValue({} as any);

      await balanceRules.revertTransfer(source, destination, 200);

      expect(mockAccountsService.update).toHaveBeenCalledWith('source-1', {
        balance: 1000,
      });
      expect(mockAccountsService.update).toHaveBeenCalledWith('dest-1', {
        balance: 500,
      });
    });

    it('should handle string balances from database', async () => {
      const source = createMockAccount(0, 'source-1');
      const destination = createMockAccount(0, 'dest-1');
      (source as any).balance = '800.00';
      (destination as any).balance = '700.00';

      mockAccountsService.update.mockResolvedValue({} as any);

      await balanceRules.revertTransfer(source, destination, 200);

      expect(mockAccountsService.update).toHaveBeenCalledWith('source-1', {
        balance: 1000,
      });
      expect(mockAccountsService.update).toHaveBeenCalledWith('dest-1', {
        balance: 500,
      });
    });

    it('should handle destination going negative (reverting might cause this)', async () => {
      const source = createMockAccount(800, 'source-1');
      const destination = createMockAccount(100, 'dest-1');

      mockAccountsService.update.mockResolvedValue({} as any);

      // Reverting a 200 transfer when destination only has 100
      await balanceRules.revertTransfer(source, destination, 200);

      // Note: Destination goes negative - potential issue
      expect(mockAccountsService.update).toHaveBeenCalledWith('dest-1', {
        balance: -100,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero amount income', async () => {
      const account = createMockAccount(1000);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1000,
      } as any);

      await balanceRules.applyIncome(account, 0);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1000,
      });
    });

    it('should handle zero amount expense', async () => {
      const account = createMockAccount(1000);
      mockAccountsService.update.mockResolvedValue({
        ...account,
        balance: 1000,
      } as any);

      await balanceRules.applyExpense(account, 0);

      expect(mockAccountsService.update).toHaveBeenCalledWith(account.id, {
        balance: 1000,
      });
    });

    it('should handle floating point precision', async () => {
      const account = createMockAccount(0.1);
      mockAccountsService.update.mockResolvedValue({} as any);

      // 0.1 + 0.2 in JavaScript can cause floating point issues
      await balanceRules.applyIncome(account, 0.2);

      // The result might be 0.30000000000000004 instead of 0.3
      // This test documents this potential issue
      const [[, updateArg]] = mockAccountsService.update.mock.calls;
      expect(updateArg.balance).toBeCloseTo(0.3, 10);
    });

    it('should handle database update failure', async () => {
      const account = createMockAccount(1000);
      mockAccountsService.update.mockRejectedValue(new Error('Database error'));

      await expect(balanceRules.applyIncome(account, 500)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
