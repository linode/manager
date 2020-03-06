import { last } from 'ramda';
import { firewallRuleFactory } from 'src/factories/firewalls';
import reducer, {
  editorStateToRules,
  initRuleEditorState
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
          status: 'NOT_MODIFIED'
        });
      });
    });

    describe('reducer', () => {
      it('adds a new rule', () => {
        const newState = reducer(baseState, {
          type: 'NEW_RULE',
          rule: firewallRuleFactory.build()
        });
        expect(newState).toHaveLength(INITIAL_RULE_LENGTH + 1);
        const lastRevisionList = last(newState);
        const lastRevision = last(lastRevisionList!);
        expect(lastRevision).toHaveProperty('status', 'NEW');
      });

      it('deletes a rule', () => {
        const idxToDelete = 1;

        const newState = reducer(baseState, {
          type: 'DELETE_RULE',
          idx: idxToDelete
        });

        const revisionList = newState[idxToDelete];

        expect(last(revisionList)).toHaveProperty('status', 'PENDING_DELETION');
      });

      it('modifies a rule', () => {
        const idxToModify = 1;

        const newState = reducer(baseState, {
          type: 'MODIFY_RULE',
          idx: idxToModify,
          modifiedRule: {
            ports: '999'
          }
        });

        const revisionList = newState[idxToModify];

        expect(revisionList).toHaveLength(2);
        expect(last(revisionList)).toHaveProperty('status', 'MODIFIED');
        expect(last(revisionList)).toHaveProperty('ports', '999');
      });

      it('allows undoing of an operation', () => {
        // First, delete a rule.
        const idx = 1;
        let newState = reducer(baseState, {
          type: 'DELETE_RULE',
          idx
        });

        // Next, undo the deletion.
        newState = reducer(newState, {
          type: 'UNDO',
          idx
        });

        expect(newState[idx]).toHaveLength(1);
        expect(last(newState[idx])).toHaveProperty('status', 'NOT_MODIFIED');
      });
    });
  });

  describe('editorStateToRules', () => {
    it('returns rules without a status', () => {
      const rulesWithoutStatus = editorStateToRules(baseState);
      expect(rulesWithoutStatus.length).toEqual(baseState.length);
      rulesWithoutStatus.forEach(thisRule => {
        expect(thisRule).not.toHaveProperty('status');
      });
    });

    it('does not include rules that have been added and then undone', () => {
      // First. add a rule.
      let newState = reducer(baseState, {
        type: 'NEW_RULE',
        rule: firewallRuleFactory.build()
      });

      // Next, undo the addition.
      newState = reducer(newState, {
        type: 'UNDO',
        idx: newState.length - 1
      });

      const rulesWithoutStatus = editorStateToRules(newState);
      expect(rulesWithoutStatus.length).toBe(baseState.length);
      rulesWithoutStatus.forEach(thisRule => {
        expect(thisRule).toBeDefined();
      });
    });
  });
});
