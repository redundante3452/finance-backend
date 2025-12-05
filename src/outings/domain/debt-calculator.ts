import { Outing } from '../entities/outing.entity';
import { OutingAccount, ServiceType } from '../entities/outing-account.entity';

export interface ParticipantBalance {
  participantId: string;
  participantName: string;
  totalConsumed: number;
  totalPaid: number;
  balance: number; // paid - consumed
}

export interface Debt {
  fromParticipantId: string;
  fromParticipantName: string;
  toParticipantId: string;
  toParticipantName: string;
  amount: number;
}

export class DebtCalculator {
  static calculate(outing: Outing): {
    balances: ParticipantBalance[];
    debts: Debt[];
  } {
    const participantMap = new Map<string, ParticipantBalance>();

    // Initialize balances
    if (outing.participants) {
      outing.participants.forEach((p) => {
        participantMap.set(p.id, {
          participantId: p.id,
          participantName: p.name,
          totalConsumed: 0,
          totalPaid: 0,
          balance: 0,
        });
      });
    }

    // Process accounts
    if (outing.accounts) {
      outing.accounts.forEach((account) => {
        this.processAccount(
          account,
          participantMap,
          outing.participants ? outing.participants.length : 0,
        );
      });
    }

    // Calculate final balance
    const balances: ParticipantBalance[] = [];
    participantMap.forEach((p) => {
      p.balance = p.totalPaid - p.totalConsumed;
      balances.push(p);
    });

    // Resolve debts using a clone of balances to preserve original values
    // We clone the objects inside the array to avoid reference modification
    const balancesForResolution = balances.map((b) => ({ ...b }));
    const debts = this.resolveDebts(balancesForResolution);

    return { balances, debts };
  }

  private static processAccount(
    account: OutingAccount,
    participantMap: Map<string, ParticipantBalance>,
    totalParticipants: number,
  ) {
    let accountSubtotal = 0;

    // 1. Calculate product consumption
    if (account.products) {
      account.products.forEach((product) => {
        const cost = Number(product.price) * product.quantity;
        accountSubtotal += cost;

        // Use participantId or fallback to participant.id if relation is loaded
        const participantId =
          product.participantId || (product as any).participant?.id;
        const participant = participantMap.get(participantId);
        if (participant) {
          participant.totalConsumed += cost;
        }
      });
    }

    // 2. Calculate Service
    let serviceAmount = 0;
    if (account.hasService && account.serviceValue > 0) {
      if (account.serviceType === ServiceType.PERCENTAGE) {
        serviceAmount = accountSubtotal * (Number(account.serviceValue) / 100);
      } else {
        serviceAmount = Number(account.serviceValue);
      }
    }

    // 3. Distribute service
    if (totalParticipants > 0 && serviceAmount > 0) {
      const servicePerPerson = serviceAmount / totalParticipants;
      participantMap.forEach((p) => {
        p.totalConsumed += servicePerPerson;
      });
    }

    // 4. Process Payments - Sum each participant's actual payments
    if (account.payers) {
      account.payers.forEach((payer) => {
        // Use participantId or fallback to participant.id if relation is loaded
        const participantId =
          payer.participantId || (payer as any).participant?.id;
        const participant = participantMap.get(participantId);
        if (participant) {
          participant.totalPaid += Number(payer.amount);
        }
      });
    }
  }

  private static resolveDebts(balances: ParticipantBalance[]): Debt[] {
    const debts: Debt[] = [];

    const debtors = balances
      .filter((b) => b.balance < -0.01)
      .sort((a, b) => a.balance - b.balance);
    const creditors = balances
      .filter((b) => b.balance > 0.01)
      .sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amountToSettle = Math.min(
        Math.abs(debtor.balance),
        creditor.balance,
      );

      if (amountToSettle > 0.01) {
        debts.push({
          fromParticipantId: debtor.participantId,
          fromParticipantName: debtor.participantName,
          toParticipantId: creditor.participantId,
          toParticipantName: creditor.participantName,
          amount: Number(amountToSettle.toFixed(2)),
        });

        debtor.balance += amountToSettle;
        creditor.balance -= amountToSettle;
      }

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return debts;
  }
}
