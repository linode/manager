// The Rule Editor works by treating each rule in a list of rules as a
// "revisionList".
//
// The "revisionList" is itself an array which lists all revisions made to a
// rule. The revision type is denoted by a `status` property.
//
// An example of a revisionList:
//
// [
//   { status: 'NOT_MODIFIED', /* ...rule */ },
//   { status: 'MODIFIED', /* ...rule */ },
//   { status: 'MODIFIED', /* ...rule */ },
// ]
//
// Thus, the rule at `revisionList[0]` is the original, and the rule at
// `revisionList[revisionList.length - 1]` is the most current.
//
// To "undo" an action, we pop() the revisionList.
//
// The ruleEditorReducer is meant to manage state for one type of rule. In other
// words, one instance of the reducer manages "inbound" rules, and another
// instance manages "outbound" rules.

import produce from 'immer';
import { FirewallRuleType } from 'linode-js-sdk/lib/firewalls';
import { last } from 'ramda';

type RuleStatus = 'NOT_MODIFIED' | 'MODIFIED' | 'NEW' | 'PENDING_DELETION';

export interface FirewallRuleWithStatus extends FirewallRuleType {
  status: RuleStatus;
}

export type RuleEditorState = FirewallRuleWithStatus[][];

export type RuleEditorAction =
  | {
      type: 'NEW_RULE';
      rule: FirewallRuleType;
    }
  | {
      type: 'DELETE_RULE';
      idx: number;
    }
  | {
      type: 'MODIFY_RULE';
      idx: number;
      modifiedRule: Partial<FirewallRuleType>;
    }
  | {
      type: 'UNDO';
      idx: number;
    };

const ruleEditorReducer = (
  draft: RuleEditorState,
  action: RuleEditorAction
) => {
  switch (action.type) {
    case 'NEW_RULE':
      draft.push([{ ...action.rule, status: 'NEW' }]);
      break;

    case 'DELETE_RULE':
      let lastRevision = last(draft[action.idx]);

      if (!lastRevision) {
        return;
      }

      draft[action.idx].push({
        ...lastRevision,
        status: 'PENDING_DELETION'
      });
      break;

    case 'MODIFY_RULE':
      lastRevision = last(draft[action.idx]);

      if (!lastRevision) {
        return;
      }

      draft[action.idx].push({
        ...lastRevision,
        ...action.modifiedRule,
        status: 'MODIFIED'
      });
      break;

    case 'UNDO':
      lastRevision = last(draft[action.idx]);

      // You can't "undo" on a rule that hasn't been modified.
      if (lastRevision?.status === 'NOT_MODIFIED') {
        return;
      }

      draft[action.idx].pop();
      break;
  }
};

export const initRuleEditorState = (
  rules: FirewallRuleType[]
): RuleEditorState =>
  rules.map(thisRule => [{ ...thisRule, status: 'NOT_MODIFIED' }]) ?? [];

export const editorStateToRules = (state: RuleEditorState) =>
  state
    .map(revisionList => {
      const lastRevision = last(revisionList);

      // If a new rule has been added, then the action has been undone, the
      // revisionList will be empty. We return undefined here and filter next.
      if (!lastRevision) {
        return;
      }

      // IMPORTANT: Make a copy here so the state is not modified.
      const lastRevisionCopy = { ...lastRevision };
      delete lastRevisionCopy.status;

      return lastRevisionCopy;
    })
    // Filter out possible undefined values from the situation outlined above.
    .filter(rule => Boolean(rule));

export default produce(ruleEditorReducer);
