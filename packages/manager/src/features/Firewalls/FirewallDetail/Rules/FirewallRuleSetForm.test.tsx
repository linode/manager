import { firewallRuleSetFactory } from 'src/factories';

import { filterRuleSets } from './FirewallRuleSetForm';

import type { FirewallRuleSet } from '@linode/api-v4';

describe('filterRuleSets', () => {
  const mockRuleSets: FirewallRuleSet[] = [
    firewallRuleSetFactory.build({
      id: 1,
      type: 'inbound',
      label: 'Inbound RS',
      deleted: null,
    }),
    firewallRuleSetFactory.build({
      id: 2,
      type: 'outbound',
      label: 'Outbound RS',
      deleted: null,
    }),
    firewallRuleSetFactory.build({
      id: 3,
      type: 'inbound',
      label: 'Deleted RS',
      deleted: '2025-11-18T18:51:11', // Marked for Deletion Rule Set
    }),
    firewallRuleSetFactory.build({
      id: 4,
      type: 'inbound',
      label: 'Already Used RS',
      deleted: null,
    }),
  ];

  it('returns only ruleSets of the correct type', () => {
    const result = filterRuleSets({
      ruleSets: mockRuleSets,
      category: 'inbound',
      inboundAndOutboundRules: [],
    });

    expect(result.map((r) => r.id)).toEqual([1, 4]);
  });

  it('excludes ruleSets already referenced by the firewall', () => {
    const result = filterRuleSets({
      ruleSets: mockRuleSets,
      category: 'inbound',
      inboundAndOutboundRules: [{ ruleset: 4 }],
    });

    expect(result.map((r) => r.id)).toEqual([1]); // excludes id=4
  });

  it('excludes ruleSets marked for deletion', () => {
    const result = filterRuleSets({
      ruleSets: mockRuleSets,
      category: 'inbound',
      inboundAndOutboundRules: [],
    });

    expect(result.some((r) => r.id === 3)).toBe(false);
  });
});
