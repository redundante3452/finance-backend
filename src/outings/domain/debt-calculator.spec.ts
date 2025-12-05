import { DebtCalculator } from './debt-calculator';
import { Outing } from '../entities/outing.entity';
import { ServiceType } from '../entities/outing-account.entity';

describe('DebtCalculator', () => {
  // Example from specification:
  // Participants: Juan, Carlos, Pepe
  // Account: Bolos
  // Consumptions:
  // - Carlos: Corona 8k (x2) = 16k
  // - Juan: Coca-Cola 3k (x1) = 3k
  // - Pepe: Manzana 3k (x1) = 3k
  // Subtotal: 22k
  // Service: 10% (2.2k) -> Divided by 3 (733.33 each)
  // Payments:
  // - Carlos: 20k
  // - Juan: 4.2k
  // Total Paid: 24.2k (matches 22k + 2.2k)

  it('should calculate debts correctly for the Bolos example', () => {
    const outing = {
      participants: [
        { id: 'juan', name: 'Juan' },
        { id: 'carlos', name: 'Carlos' },
        { id: 'pepe', name: 'Pepe' },
      ],
      accounts: [
        {
          id: 'bolos',
          name: 'Bolos',
          hasService: true,
          serviceType: ServiceType.PERCENTAGE,
          serviceValue: 10,
          products: [
            { participantId: 'carlos', price: 8000, quantity: 2 },
            { participantId: 'juan', price: 3000, quantity: 1 },
            { participantId: 'pepe', price: 3000, quantity: 1 },
          ],
          payers: [
            { participantId: 'carlos', amount: 20000 },
            { participantId: 'juan', amount: 4200 },
          ],
        },
      ],
    } as Outing;

    const result = DebtCalculator.calculate(outing);

    // Expected Consumption:
    // Carlos: 16000 + 733.33 = 16733.33
    // Juan: 3000 + 733.33 = 3733.33
    // Pepe: 3000 + 733.33 = 3733.33

    // Expected Balances (Paid - Consumed):
    // Carlos: 20000 - 16733.33 = +3266.67
    // Juan: 4200 - 3733.33 = +466.67
    // Pepe: 0 - 3733.33 = -3733.33

    const carlos = result.balances.find((b) => b.participantId === 'carlos');
    const juan = result.balances.find((b) => b.participantId === 'juan');
    const pepe = result.balances.find((b) => b.participantId === 'pepe');

    expect(carlos.balance).toBeCloseTo(3266.67, 1);
    expect(juan.balance).toBeCloseTo(466.67, 1);
    expect(pepe.balance).toBeCloseTo(-3733.33, 1);

    // Debts resolution:
    // Pepe owes money. He should pay Carlos and Juan.
    // Total debt: 3733.33
    // Carlos needs: 3266.67
    // Juan needs: 466.67
    // So Pepe pays 3266.67 to Carlos and 466.67 to Juan.

    const debtsToCarlos = result.debts.find(
      (d) => d.toParticipantId === 'carlos',
    );
    const debtsToJuan = result.debts.find((d) => d.toParticipantId === 'juan');

    expect(debtsToCarlos).toBeDefined();
    expect(debtsToCarlos.fromParticipantId).toBe('pepe');
    expect(debtsToCarlos.amount).toBeCloseTo(3266.67, 1);

    expect(debtsToJuan).toBeDefined();
    expect(debtsToJuan.fromParticipantId).toBe('pepe');
    expect(debtsToJuan.amount).toBeCloseTo(466.67, 1);
  });

  it('should handle multiple accounts', () => {
    // Account 1: A spends 100, pays 100. Balance 0.
    // Account 2: B spends 100, A pays 100. B owes A 100.
    const outing = {
      participants: [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' },
      ],
      accounts: [
        {
          id: '1',
          hasService: false,
          products: [{ participantId: 'A', price: 100, quantity: 1 }],
          payers: [{ participantId: 'A', amount: 100 }],
        },
        {
          id: '2',
          hasService: false,
          products: [{ participantId: 'B', price: 100, quantity: 1 }],
          payers: [{ participantId: 'A', amount: 100 }],
        },
      ],
    } as Outing;

    const result = DebtCalculator.calculate(outing);

    // A Total Consumed: 100
    // A Total Paid: 200
    // A Balance: +100

    // B Total Consumed: 100
    // B Total Paid: 0
    // B Balance: -100

    const balanceA = result.balances.find((b) => b.participantId === 'A');
    const balanceB = result.balances.find((b) => b.participantId === 'B');

    expect(balanceA.balance).toBe(100);
    expect(balanceB.balance).toBe(-100);

    expect(result.debts).toHaveLength(1);
    expect(result.debts[0]).toEqual({
      fromParticipantId: 'B',
      fromParticipantName: 'B',
      toParticipantId: 'A',
      toParticipantName: 'A',
      amount: 100,
    });
  });

  it('should handle fixed service value', () => {
    // Service: 300 fixed. 3 people -> 100 each.
    const outing = {
      participants: [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' },
        { id: 'C', name: 'C' },
      ],
      accounts: [
        {
          id: '1',
          hasService: true,
          serviceType: ServiceType.FIXED,
          serviceValue: 300,
          products: [], // No products, just service charge
          payers: [{ participantId: 'A', amount: 300 }],
        },
      ],
    } as Outing;

    const result = DebtCalculator.calculate(outing);

    // Each consumes 100 (service share)
    // A pays 300
    // A Balance: 300 - 100 = +200
    // B Balance: 0 - 100 = -100
    // C Balance: 0 - 100 = -100

    const balanceA = result.balances.find((b) => b.participantId === 'A');
    expect(balanceA.balance).toBeCloseTo(200);

    // B and C should pay A
    // Order might vary depending on sort stability, but debts should sum to 200
    const debtFromB = result.debts.find((d) => d.fromParticipantId === 'B');
    const debtFromC = result.debts.find((d) => d.fromParticipantId === 'C');

    expect(debtFromB.toParticipantId).toBe('A');
    expect(debtFromB.amount).toBe(100);
    expect(debtFromC.toParticipantId).toBe('A');
    expect(debtFromC.amount).toBe(100);
  });

  it('should correctly sum multiple payments from same participant (bug fix test)', () => {
    // Bug scenario: Manuel pays $11,500 + $7,500 = $19,000
    // Juanka pays $7,500
    // Jhonatan pays $0
    // Total: $26,500
    // Bug was: backend was dividing total by participants (8833 each)
    const outing = {
      participants: [
        { id: 'manuel', name: 'Manuel' },
        { id: 'jhonatan', name: 'Jhonatan' },
        { id: 'juanka', name: 'Juanka' },
      ],
      accounts: [
        {
          id: 'account1',
          hasService: false,
          products: [
            { participantId: 'manuel', price: 11500, quantity: 1 },
            { participantId: 'jhonatan', price: 7500, quantity: 1 },
            { participantId: 'juanka', price: 7500, quantity: 1 },
          ],
          payers: [
            { participantId: 'manuel', amount: 11500 },
            { participantId: 'juanka', amount: 7500 },
            { participantId: 'manuel', amount: 7500 }, // Manuel pays twice
          ],
        },
      ],
    } as Outing;

    const result = DebtCalculator.calculate(outing);

    const manuel = result.balances.find((b) => b.participantId === 'manuel');
    const jhonatan = result.balances.find((b) => b.participantId === 'jhonatan');
    const juanka = result.balances.find((b) => b.participantId === 'juanka');

    // Manuel: consumed 11500, paid 11500 + 7500 = 19000, balance = +7500
    expect(manuel.totalConsumed).toBe(11500);
    expect(manuel.totalPaid).toBe(19000);
    expect(manuel.balance).toBe(7500);

    // Jhonatan: consumed 7500, paid 0, balance = -7500
    expect(jhonatan.totalConsumed).toBe(7500);
    expect(jhonatan.totalPaid).toBe(0);
    expect(jhonatan.balance).toBe(-7500);

    // Juanka: consumed 7500, paid 7500, balance = 0
    expect(juanka.totalConsumed).toBe(7500);
    expect(juanka.totalPaid).toBe(7500);
    expect(juanka.balance).toBe(0);

    // Jhonatan owes Manuel $7500
    expect(result.debts).toHaveLength(1);
    expect(result.debts[0].fromParticipantId).toBe('jhonatan');
    expect(result.debts[0].toParticipantId).toBe('manuel');
    expect(result.debts[0].amount).toBe(7500);
  });

  it('should use participant relation as fallback when participantId is undefined', () => {
    // Simulates TypeORM loading participant relation but not participantId column
    const outing = {
      participants: [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' },
      ],
      accounts: [
        {
          id: '1',
          hasService: false,
          products: [
            { participant: { id: 'A' }, price: 100, quantity: 1 },
            { participant: { id: 'B' }, price: 100, quantity: 1 },
          ],
          payers: [
            { participant: { id: 'A' }, amount: 200 },
          ],
        },
      ],
    } as any;

    const result = DebtCalculator.calculate(outing);

    const balanceA = result.balances.find((b) => b.participantId === 'A');
    const balanceB = result.balances.find((b) => b.participantId === 'B');

    expect(balanceA.totalPaid).toBe(200);
    expect(balanceA.totalConsumed).toBe(100);
    expect(balanceA.balance).toBe(100);

    expect(balanceB.totalPaid).toBe(0);
    expect(balanceB.totalConsumed).toBe(100);
    expect(balanceB.balance).toBe(-100);
  });
});
