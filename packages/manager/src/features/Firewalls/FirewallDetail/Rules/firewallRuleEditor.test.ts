import { last } from 'ramda';
import { firewallRuleFactory } from 'src/factories/firewalls';
import reducer, {
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
      baseState.revisionLists.forEach((thisRevisionList, i) => {
        // The first element in each revisionList should be equal to the
        // original rule, plus a status of "NOT_MODIFIED".
        expect(thisRevisionList[0]).toEqual({
          ...rules[i],
          originalIndex: i,
          status: 'NOT_MODIFIED',
        });
      });
    });

    describe('reducer', () => {
      it('adds a new rule', () => {
        const newState = reducer(baseState, {
          type: 'NEW_RULE',
          rule: firewallRuleFactory.build(),
        });
        expect(newState.revisionLists).toHaveLength(INITIAL_RULE_LENGTH + 1);
        const lastRevisionList = last(newState.revisionLists);
        const lastRevision = last(lastRevisionList!);
        expect(lastRevision).toHaveProperty('status', 'NEW');
      });

      it('deletes a rule', () => {
        const idxToDelete = 1;

        const newState = reducer(baseState, {
          type: 'DELETE_RULE',
          idx: idxToDelete,
        });

        const revisionList = newState.revisionLists[idxToDelete];

        expect(last(revisionList)).toHaveProperty('status', 'PENDING_DELETION');
      });

      it('modifies a rule', () => {
        const idxToModify = 1;

        const newState = reducer(baseState, {
          type: 'MODIFY_RULE',
          idx: idxToModify,
          modifiedRule: {
            ports: '999',
          },
        });

        const revisionList = newState.revisionLists[idxToModify];

        expect(revisionList).toHaveLength(2);
        expect(last(revisionList)).toHaveProperty('status', 'MODIFIED');
        expect(last(revisionList)).toHaveProperty('ports', '999');
      });

      it('allows undoing of an operation', () => {
        // First, delete a rule.
        const idx = 1;
        let newState = reducer(baseState, {
          type: 'DELETE_RULE',
          idx,
        });

        // Next, undo the deletion.
        newState = reducer(newState, {
          type: 'UNDO',
          idx,
        });

        expect(newState.revisionLists[idx]).toHaveLength(1);
        expect(last(newState.revisionLists[idx])).toHaveProperty(
          'status',
          'NOT_MODIFIED'
        );
      });

      it('discards all changes', () => {
        // First, add and modify rules.
        let newState = reducer(baseState, {
          type: 'MODIFY_RULE',
          idx: 0,
          modifiedRule: {
            ports: '999',
          },
        });
        newState = reducer(newState, {
          type: 'NEW_RULE',
          rule: firewallRuleFactory.build(),
        });

        const finalState = reducer(newState, {
          type: 'DISCARD_CHANGES',
        });
        expect(finalState.revisionLists).toHaveLength(
          baseState.revisionLists.length
        );
        expect(finalState.revisionLists[0]).toHaveLength(1);
        expect(finalState.revisionLists[0][0]).toEqual(
          baseState.revisionLists[0][0]
        );
      });

      it('resets the reducer state', () => {
        // First, add and modify rules.
        let newState = reducer(baseState, {
          type: 'MODIFY_RULE',
          idx: 0,
          modifiedRule: {
            ports: '999',
          },
        });
        newState = reducer(newState, {
          type: 'NEW_RULE',
          rule: firewallRuleFactory.build(),
        });

        const finalState = reducer(newState, {
          type: 'RESET',
          rules,
        });
        finalState.revisionLists.forEach((thisRevisionList) => {
          expect(thisRevisionList).toHaveLength(1);
        });
      });

      it('reorders the revision lists', () => {
        const newState = reducer(baseState, {
          type: 'REORDER',
          startIdx: 1,
          endIdx: 0,
        });
        expect(newState.revisionLists[0][0]).toHaveProperty('originalIndex', 1);
        expect(newState.revisionLists[1][0]).toHaveProperty('originalIndex', 0);
      });
    });
  });

  describe('editorStateToRules', () => {
    it('does not include rules that have been added and then undone', () => {
      // First. add a rule.
      let newState = reducer(baseState, {
        type: 'NEW_RULE',
        rule: firewallRuleFactory.build(),
      });

      // Next, undo the addition.
      newState = reducer(newState, {
        type: 'UNDO',
        idx: newState.revisionLists.length - 1,
      });

      const rulesWithoutStatus = editorStateToRules(newState);
      expect(rulesWithoutStatus.length).toBe(baseState.revisionLists.length);
      rulesWithoutStatus.forEach((thisRule) => {
        expect(thisRule).toBeDefined();
      });
    });
  });

  describe('prepareRules', () => {
    it('removes the `ports` field for ICMP rules if `ports` is an empty string', () => {
      const rules = [
        firewallRuleFactory.build({ protocol: 'ICMP', ports: '1234' }),
        firewallRuleFactory.build({ protocol: 'ICMP', ports: '' }),
        firewallRuleFactory.build({ protocol: 'TCP', ports: '' }),
      ];
      const editorState = initRuleEditorState(rules);
      const result = prepareRules(editorState);
      expect(result[0]).toHaveProperty('ports', '1234');
      expect(result[1]).not.toHaveProperty('ports');
      expect(result[2]).toHaveProperty('ports', '');
    });
  });
});
