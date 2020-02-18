import reducer, {
  FirewallRuleWithStatus,
  RuleEditorState
} from './ruleEditorReducer';

const rule1: FirewallRuleWithStatus = {
  status: 'NOT_MODIFIED',
  ports: '22',
  protocol: 'TCP',
  addresses: {
    ipv4: ['0.0.0.0/0'],
    ipv6: ['::0/0']
  }
};

const rule2: FirewallRuleWithStatus = {
  status: 'MODIFIED',
  ports: '23',
  protocol: 'TCP',
  addresses: {
    ipv4: ['0.0.0.0/0'],
    ipv6: ['::0/0']
  }
};

const rule3: FirewallRuleWithStatus = {
  status: 'NEW',
  ports: '53',
  protocol: 'TCP',
  addresses: {
    ipv4: ['0.0.0.0/0'],
    ipv6: ['::0/0']
  }
};

describe('ruleEditorReducer', () => {
  const baseState: RuleEditorState = {
    mode: 'VIEWING',
    revisions: {
      inbound: [[rule1]],
      outbound: [[rule2]]
    }
  };

  it('adds a new rule', () => {
    const newState = reducer(baseState, {
      type: 'NEW_RULE',
      ruleType: 'inbound',
      rule: rule3
    });
    expect(newState.revisions.inbound).toHaveLength(2);
    expect(newState.mode).toBe('EDITING');
  });

  it('deletes a rule', () => {
    let newState = reducer(baseState, {
      type: 'NEW_RULE',
      ruleType: 'inbound',
      rule: rule3
    });
    newState = reducer(newState, {
      type: 'DELETE_RULE',
      ruleType: 'inbound',
      idx: 1
    });

    const ruleRevisions = newState.revisions.inbound[1];

    expect(newState.revisions.inbound).toHaveLength(2);
    expect(ruleRevisions[ruleRevisions.length - 1]).toHaveProperty(
      'status',
      'PENDING_DELETION'
    );
    expect(newState.mode).toBe('EDITING');
  });
});
