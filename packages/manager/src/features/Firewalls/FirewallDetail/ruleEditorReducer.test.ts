import { firewallRuleFactory } from 'src/factories/firewalls';
import reducer, {
  initRuleEditorState,
  initRuleWithStatus
} from './ruleEditorReducer';

const rules = {
  inbound: firewallRuleFactory.buildList(2),
  outbound: firewallRuleFactory.buildList(2)
};

describe('ruleEditorReducer', () => {
  const baseState = initRuleEditorState(rules);

  describe('initRuleEditorState', () => {
    it('initializes mode as VIEWING', () => {
      expect(baseState.mode).toBe('VIEWING');
    });

    it('initializes a revision array for each rule', () => {
      baseState.revisions.inbound.forEach((rule, i) => {
        expect(rule).toHaveLength(1);
        expect(rule[0]).toHaveProperty('status', 'NOT_MODIFIED');
        expect(rule[0]).toEqual({
          ...rules.inbound[i],
          status: 'NOT_MODIFIED'
        });
      });
      baseState.revisions.outbound.forEach((rule, i) => {
        expect(rule).toHaveLength(1);
        expect(rule[0]).toHaveProperty('status', 'NOT_MODIFIED');
        expect(rule[0]).toEqual({
          ...rules.outbound[i],
          status: 'NOT_MODIFIED'
        });
      });
    });
  });

  describe('reducer', () => {
    it('adds a new rule', () => {
      const newState = reducer(baseState, {
        type: 'NEW_RULE',
        ruleType: 'inbound',
        rule: initRuleWithStatus(firewallRuleFactory.build())
      });
      expect(newState.revisions.inbound).toHaveLength(3);
    });

    it('deletes a rule', () => {
      const newState = reducer(baseState, {
        type: 'DELETE_RULE',
        ruleType: 'inbound',
        idx: 1
      });

      const ruleRevisions = newState.revisions.inbound[1];

      expect(ruleRevisions[ruleRevisions.length - 1]).toHaveProperty(
        'status',
        'PENDING_DELETION'
      );
      expect(newState.mode).toBe('EDITING');
    });

    it('modifies a rule', () => {
      const newState = reducer(baseState, {
        type: 'MODIFY_RULE',
        ruleType: 'inbound',
        idx: 0,
        modifiedRule: {
          ports: '999'
        }
      });
      expect(newState.revisions.inbound[0]).toHaveLength(2);
      expect(newState.revisions.inbound[0][1]).toHaveProperty(
        'status',
        'MODIFIED'
      );
    });
  });
});
