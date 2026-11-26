import type { ResourceId, ResourceBundle } from '../data/resources.js';

export class InsufficientResourcesError extends Error {
  constructor(public readonly shortfall: ResourceBundle) {
    super(`Insufficient resources: ${JSON.stringify(shortfall)}`);
    this.name = 'InsufficientResourcesError';
  }
}

export class ResourceLedger {
  private balances: Map<ResourceId, number>;
  private readonly log: Array<{ ts: number; op: 'credit' | 'debit'; bundle: ResourceBundle; note: string }> = [];

  constructor(initial: ResourceBundle = {}) {
    this.balances = new Map(Object.entries(initial) as [ResourceId, number][]);
  }

  get(id: ResourceId): number {
    return this.balances.get(id) ?? 0;
  }

  snapshot(): ResourceBundle {
    return Object.fromEntries(this.balances) as ResourceBundle;
  }

  credit(bundle: ResourceBundle, note = ''): void {
    for (const [id, amount] of Object.entries(bundle) as [ResourceId, number][]) {
      if (amount < 0) throw new Error(`Credit amount must be non-negative for ${id}`);
      this.balances.set(id, (this.balances.get(id) ?? 0) + amount);
    }
    this.log.push({ ts: Date.now(), op: 'credit', bundle, note });
  }

  debit(bundle: ResourceBundle, note = ''): void {
    const shortfall: ResourceBundle = {};
    for (const [id, amount] of Object.entries(bundle) as [ResourceId, number][]) {
      const have = this.balances.get(id) ?? 0;
      if (have < (amount ?? 0)) shortfall[id as ResourceId] = (amount ?? 0) - have;
    }
    if (Object.keys(shortfall).length > 0) throw new InsufficientResourcesError(shortfall);
    for (const [id, amount] of Object.entries(bundle) as [ResourceId, number][]) {
      this.balances.set(id as ResourceId, (this.balances.get(id as ResourceId) ?? 0) - (amount ?? 0));
    }
    this.log.push({ ts: Date.now(), op: 'debit', bundle, note });
  }

  canAfford(bundle: ResourceBundle): boolean {
    for (const [id, amount] of Object.entries(bundle) as [ResourceId, number][]) {
      if ((this.balances.get(id as ResourceId) ?? 0) < (amount ?? 0)) return false;
    }
    return true;
  }

  auditLog() {
    return [...this.log];
  }
}
