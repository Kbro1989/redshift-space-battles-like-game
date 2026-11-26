import { describe, it, expect } from 'vitest';
import { ResourceLedger, InsufficientResourcesError } from '../src/economy/resource-ledger.js';

describe('ResourceLedger', () => {
  it('starts at zero balances', () => {
    const ledger = new ResourceLedger();
    expect(ledger.get('credits')).toBe(0);
    expect(ledger.get('metal')).toBe(0);
  });

  it('credits resources correctly', () => {
    const ledger = new ResourceLedger();
    ledger.credit({ credits: 1000, metal: 500 }, 'initial grant');
    expect(ledger.get('credits')).toBe(1000);
    expect(ledger.get('metal')).toBe(500);
  });

  it('debits resources correctly', () => {
    const ledger = new ResourceLedger({ credits: 1000, metal: 500 });
    ledger.debit({ credits: 300 }, 'construction');
    expect(ledger.get('credits')).toBe(700);
    expect(ledger.get('metal')).toBe(500);
  });

  it('throws on insufficient resources', () => {
    const ledger = new ResourceLedger({ credits: 100 });
    expect(() => ledger.debit({ credits: 500 })).toThrowError(InsufficientResourcesError);
  });

  it('canAfford returns false when short', () => {
    const ledger = new ResourceLedger({ credits: 100 });
    expect(ledger.canAfford({ credits: 500 })).toBe(false);
  });

  it('canAfford returns true when sufficient', () => {
    const ledger = new ResourceLedger({ credits: 500 });
    expect(ledger.canAfford({ credits: 500 })).toBe(true);
  });

  it('audit log records every transaction', () => {
    const ledger = new ResourceLedger();
    ledger.credit({ credits: 1000 }, 'grant');
    ledger.debit({ credits: 200 }, 'spend');
    const log = ledger.auditLog();
    expect(log).toHaveLength(2);
    expect(log[0].op).toBe('credit');
    expect(log[1].op).toBe('debit');
  });

  it('credit rejects negative amounts', () => {
    const ledger = new ResourceLedger();
    expect(() => ledger.credit({ credits: -100 })).toThrow();
  });
});
