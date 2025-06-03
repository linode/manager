import { firewallRuleFactory } from 'src/factories/firewalls';

import {
  curriedFirewallRuleEditorReducer,
  editorStateToRules,
  initRuleEditorState,
  prepareRules,
} from './firewallRuleEditor';

const INITIAL_RULE_LENGTH = 2;
const rules = firewallRuleFactory.buildList(INITIAL_RULE_LENGTH);

describe('Rule Editor', () => {
  const baseState = initRuleEditorState(rules);

  describe('initRuleEditorState', () => {
    it('initializes a list of revisions for each rule', () => {
      baseState.forEach((revisionList, i) => {
        // The first element in each revisionList should be equal to the
        // original rule, plus a status of "NOT_MODIFIED".
        expect(revisionList[0]).toEqual({
          ...rules[i],
          originalIndex: i,
          status: 'NOT_MODIFIED',
        });
      });
    });

    describe('reducer', () => {
      it('adds a new rule', () => {
        const newState = curriedFirewallRuleEditorReducer(baseState, {
          rule: firewallRuleFactory.build(),
          type: 'NEW_RULE',
        });
        expect(newState).toHaveLength(INITIAL_RULE_LENGTH + 1);
        const lastRevisionList = newState.at(-1);
        const lastRevision = lastRevisionList!.at(-1);
        expect(lastRevision).toHaveProperty('status', 'NEW');
      });

      it('deletes a rule', () => {
        const idxToDelete = 1;

        const newState = curriedFirewallRuleEditorReducer(baseState, {
          idx: idxToDelete,
          type: 'DELETE_RULE',
        });

        const revisionList = newState[idxToDelete];

        expect(revisionList.at(-1)).toHaveProperty('status', 'PENDING_DELETION');
      });

      it('modifies a rule', () => {
        const idxToModify = 1;

        const newState = curriedFirewallRuleEditorReducer(baseState, {
          idx: idxToModify,
          modifiedRule: {
            ports: '999',
          },
          type: 'MODIFY_RULE',
        });

        const revisionList = newState[idxToModify];

        expect(revisionList).toHaveLength(2);
        expect(revisionList.at(-1)).toHaveProperty('status', 'MODIFIED');
        expect(revisionList.at(-1)).toHaveProperty('ports', '999');
      });

      it('allows undoing of an operation', () => {
        // First, delete a rule.
        const idx = 1;
        let newState = curriedFirewallRuleEditorReducer(baseState, {
          idx,
          type: 'DELETE_RULE',
        });

        // Next, undo the deletion.
        newState = curriedFirewallRuleEditorReducer(newState, {
          idx,
          type: 'UNDO',
        });

        expect(newState[idx]).toHaveLength(1);
        expect(newState[idx].at(-1)).toHaveProperty('status', 'NOT_MODIFIED');
      });

      it('discards all changes', () => {
        // First, add and modify rules.
        let newState = curriedFirewallRuleEditorReducer(baseState, {
          idx: 0,
          modifiedRule: {
            ports: '999',
          },
          type: 'MODIFY_RULE',
        });
        newState = curriedFirewallRuleEditorReducer(newState, {
          rule: firewallRuleFactory.build(),
          type: 'NEW_RULE',
        });

        const finalState = curriedFirewallRuleEditorReducer(newState, {
          type: 'DISCARD_CHANGES',
        });
        expect(finalState).toHaveLength(baseState.length);
        expect(finalState[0]).toHaveLength(1);
        expect(finalState[0][0]).toEqual(baseState[0][0]);
      });

      it('resets the reducer state', () => {
        // First, add and modify rules.
        let newState = curriedFirewallRuleEditorReducer(baseState, {
          idx: 0,
          modifiedRule: {
            ports: '999',
          },
          type: 'MODIFY_RULE',
        });
        newState = curriedFirewallRuleEditorReducer(newState, {
          rule: firewallRuleFactory.build(),
          type: 'NEW_RULE',
        });

        const finalState = curriedFirewallRuleEditorReducer(newState, {
          rules,
          type: 'RESET',
        });
        finalState.forEach((revisionList) => {
          expect(revisionList).toHaveLength(1);
        });
      });

      it('reorders the revision lists', () => {
        const newState = curriedFirewallRuleEditorReducer(baseState, {
          endIdx: 0,
          startIdx: 1,
          type: 'REORDER',
        });
        expect(newState[0][0]).toHaveProperty('originalIndex', 1);
        expect(newState[1][0]).toHaveProperty('originalIndex', 0);
      });
    });
  });

  describe('editorStateToRules', () => {
    it('does not include rules that have been added and then undone', () => {
      // First. add a rule.
      let newState = curriedFirewallRuleEditorReducer(baseState, {
        rule: firewallRuleFactory.build(),
        type: 'NEW_RULE',
      });

      // Next, undo the addition.
      newState = curriedFirewallRuleEditorReducer(newState, {
        idx: newState.length - 1,
        type: 'UNDO',
      });

      const rulesWithoutStatus = editorStateToRules(newState);
      expect(rulesWithoutStatus.length).toBe(baseState.length);
      rulesWithoutStatus.forEach((thisRule) => {
        expect(thisRule).toBeDefined();
      });
    });
  });

  describe('prepareRules', () => {
    it('removes the `ports` field for ICMP and IPENCAP rules if `ports` is an empty string', () => {
      const rules = [
        firewallRuleFactory.build({ ports: '1234', protocol: 'ICMP' }),
        firewallRuleFactory.build({ ports: '', protocol: 'ICMP' }),
        firewallRuleFactory.build({ ports: '', protocol: 'TCP' }),
        firewallRuleFactory.build({ ports: '1234', protocol: 'IPENCAP' }),
        firewallRuleFactory.build({ ports: '', protocol: 'IPENCAP' }),
      ];
      const editorState = initRuleEditorState(rules);
      const result = prepareRules(editorState);
      expect(result[0]).toHaveProperty('ports', '1234');
      expect(result[1]).not.toHaveProperty('ports');
      expect(result[2]).toHaveProperty('ports', '');
      expect(result[3]).toHaveProperty('ports', '1234');
      expect(result[4]).not.toHaveProperty('ports');
    });
  });
});
