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
import { FirewallRuleType } from '@linode/api-v4/lib/firewalls';
import { compose, last, omit } from 'ramda';
import { FirewallRuleError } from './shared';

export type RuleStatus =
  | 'NOT_MODIFIED'
  | 'MODIFIED'
  | 'NEW'
  | 'PENDING_DELETION';

export interface ExtendedFirewallRule extends FirewallRuleType {
  status: RuleStatus;
  index?: number;
  errors?: FirewallRuleError[];
}

export type RuleEditorState = ExtendedFirewallRule[][];

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
      type: 'SET_ERROR';
      idx: number;
      error: FirewallRuleError;
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

      // Seems pointless to show errors on rules pending deletion.
      delete lastRevision.errors;

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

      // Errors might no longer apply to the modified rule, so we delete them.
      delete lastRevision.errors;

      if (!action.modifiedRule.label) {
        delete lastRevision.label;
      }

      if (!action.modifiedRule.description) {
        delete lastRevision.description;
      }

      draft[action.idx].push({
        ...lastRevision,
        ...action.modifiedRule,
        status: 'MODIFIED'
      });
      return;

    case 'SET_ERROR':
      lastRevision = last(draft[action.idx]);

      if (!lastRevision) {
        return;
      }

      if (!lastRevision.errors) {
        lastRevision.errors = [];
      }

      lastRevision.errors.push(action.error);
      return;

    case 'UNDO':
      lastRevision = last(draft[action.idx]);

      draft[action.idx].pop();

      // If there's nothing left on the stack, we need to actually remove this revisionList.
      // This will only happen if a user performing UNDO on a NEW rule.
      if (draft[action.idx].length === 0) {
        draft.splice(action.idx, 1);
      }

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
  state: RuleEditorState
): ExtendedFirewallRule[] =>
  state.map(revisionList => revisionList[revisionList.length - 1]);

// Remove fields we use internally.
export const stripExtendedFields = (
  rule: ExtendedFirewallRule
): FirewallRuleType => omit(['errors', 'status', 'index'], rule);

// The API will return an error if a `ports` attribute is present on a payload for an ICMP rule,
// so we do a bit of trickery here and delete it if necessary.
export const removeICMPPort = (rules: ExtendedFirewallRule[]) =>
  rules.map(thisRule => {
    if (thisRule.protocol === 'ICMP' && thisRule.ports === '') {
      delete thisRule.ports;
    }
    return thisRule;
  });

export const filterRulesPendingDeletion = (rules: ExtendedFirewallRule[]) =>
  rules.filter(thisRule => thisRule.status !== 'PENDING_DELETION');

export const appendIndex = (rules: ExtendedFirewallRule[]) =>
  rules.map((thisRule, index) => ({ ...thisRule, index }));

export const prepareRules = compose(
  removeICMPPort,
  filterRulesPendingDeletion,
  appendIndex,
  editorStateToRules
);

export const hasModified = (editorState: RuleEditorState) => {
  const rules = editorStateToRules(editorState);
  return rules.find(thisRule => thisRule.status !== 'NOT_MODIFIED');
};

export default produce(ruleEditorReducer);
