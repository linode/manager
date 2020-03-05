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

export type RuleStatus =
  | 'NOT_MODIFIED'
  | 'MODIFIED'
  | 'NEW'
  | 'PENDING_DELETION';

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
    }
  | {
      type: 'DISCARD_CHANGES';
    }
  | {
      type: 'RESET';
      rules: FirewallRuleType[];
    };

const ruleEditorReducer = (
  draft: RuleEditorState,
  action: RuleEditorAction
) => {
  switch (action.type) {
    case 'NEW_RULE':
      draft.push([{ ...action.rule, status: 'NEW' }]);
      return;

    case 'DELETE_RULE':
      let lastRevision = last(draft[action.idx]);

      if (!lastRevision) {
        return;
      }

      draft[action.idx].push({
        ...lastRevision,
        status: 'PENDING_DELETION'
      });
      return;

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
      return;

    case 'UNDO':
      lastRevision = last(draft[action.idx]);

      // You can't "undo" on a rule that hasn't been modified.
      if (lastRevision?.status === 'NOT_MODIFIED') {
        return;
      }

      draft[action.idx].pop();
      return;

    case 'DISCARD_CHANGES':
      const original: RuleEditorState = [];
      draft.forEach(revisionList => {
        const head = revisionList[0];
        if (head.status === 'NOT_MODIFIED') {
          original.push([head]);
        }
      });
      return original;

    case 'RESET':
      return initRuleEditorState(action.rules);
  }
};

export const initRuleEditorState = (
  rules: FirewallRuleType[]
): RuleEditorState =>
  rules.map(thisRule => [{ ...thisRule, status: 'NOT_MODIFIED' }]) ?? [];

export const editorStateToRules = (
  state: RuleEditorState,
  withStatus = true
): FirewallRuleWithStatus[] => {
  const res: FirewallRuleWithStatus[] = [];
  state.forEach(revisionList => {
    const lastRevision = last(revisionList);

    if (!lastRevision) {
      return;
    }

    // IMPORTANT: Make a copy here so the state is not modified.
    const lastRevisionCopy = { ...lastRevision };

    if (!withStatus) {
      delete lastRevisionCopy.status;
    }

    res.push(lastRevisionCopy);
  });
  return res;
};

export const hasModified = (editorState: RuleEditorState) => {
  const rules = editorStateToRules(editorState);
  return rules.find(thisRule => thisRule.status !== 'NOT_MODIFIED');
};

export default produce(ruleEditorReducer);
