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
// The original index of each rule is captured and stored with each rule. This
// way we can "Discard Changes" even after the ruleset has be reordered.
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
  originalIndex: number;
}

export interface RuleEditorState {
  revisionLists: ExtendedFirewallRule[][];
  hasModifiedOrder: boolean;
}

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
      type: 'CLONE_RULE';
      idx: number;
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
    }
  | {
      type: 'REORDER';
      startIdx: number;
      endIdx: number;
    };

const ruleEditorReducer = (
  draft: RuleEditorState,
  action: RuleEditorAction
) => {
  switch (action.type) {
    case 'NEW_RULE':
      draft.revisionLists.push([
        {
          ...action.rule,
          originalIndex: draft.revisionLists.length,
          status: 'NEW',
        },
      ]);
      return;

    case 'DELETE_RULE':
      let lastRevision = last(draft.revisionLists[action.idx]);

      if (!lastRevision) {
        return;
      }

      // Seems pointless to show errors on rules pending deletion.
      delete lastRevision.errors;

      draft.revisionLists[action.idx].push({
        ...lastRevision,
        status: 'PENDING_DELETION',
      });
      return;

    case 'MODIFY_RULE':
      lastRevision = last(draft.revisionLists[action.idx]);

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

      draft.revisionLists[action.idx].push({
        ...lastRevision,
        ...action.modifiedRule,
        status: 'MODIFIED',
      });
      return;

    case 'CLONE_RULE':
      const ruleToClone = last(draft.revisionLists[action.idx]);
      if (!ruleToClone) {
        return;
      }
      const { addresses, ports, protocol, action: _action } = ruleToClone;
      draft.revisionLists.push([
        {
          action: _action,
          addresses,
          ports,
          protocol,
          originalIndex: draft.revisionLists.length,
          status: 'NEW',
        },
      ]);
      return;

    case 'SET_ERROR':
      lastRevision = last(draft.revisionLists[action.idx]);

      if (!lastRevision) {
        return;
      }

      if (!lastRevision.errors) {
        lastRevision.errors = [];
      }

      lastRevision.errors.push(action.error);
      return;

    case 'UNDO':
      lastRevision = last(draft.revisionLists[action.idx]);

      draft.revisionLists[action.idx].pop();

      // If there's nothing left on the stack, we need to actually remove this revisionList.
      // This will only happen if a user performing UNDO on a NEW rule.
      if (draft.revisionLists[action.idx].length === 0) {
        draft.revisionLists.splice(action.idx, 1);
      }

      return;

    case 'DISCARD_CHANGES':
      const original: RuleEditorState['revisionLists'] = [];
      draft.revisionLists.forEach((thisRevisionList) => {
        const head = thisRevisionList[0];
        if (head.status === 'NOT_MODIFIED') {
          original[head.originalIndex] = [head];
        }
      });
      return { revisionLists: original, hasModifiedOrder: false };

    case 'RESET':
      return initRuleEditorState(action.rules);

    case 'REORDER':
      const [removed] = draft.revisionLists.splice(action.startIdx, 1);
      draft.revisionLists.splice(action.endIdx, 0, removed);
      draft.hasModifiedOrder = true;
      return;
  }
};

export const initRuleEditorState = (
  rules: FirewallRuleType[]
): RuleEditorState => ({
  revisionLists:
    rules.map((thisRule, index) => [
      { ...thisRule, originalIndex: index, status: 'NOT_MODIFIED' },
    ]) ?? [],
  hasModifiedOrder: false,
});

export const editorStateToRules = (
  state: RuleEditorState
): ExtendedFirewallRule[] =>
  state.revisionLists.map(
    (thisRevisionList) => thisRevisionList[thisRevisionList.length - 1]
  );

// Remove fields we use internally.
export const stripExtendedFields = (
  rule: ExtendedFirewallRule
): FirewallRuleType => omit(['errors', 'status', 'originalIndex'], rule);

// The API will return an error if a `ports` attribute is present on a payload for an ICMP rule,
// so we do a bit of trickery here and delete it if necessary.
export const removeICMPPort = (
  rules: ExtendedFirewallRule[]
): ExtendedFirewallRule[] =>
  rules.map((thisRule) => {
    if (thisRule.protocol === 'ICMP' && thisRule.ports === '') {
      delete thisRule.ports;
    }
    return thisRule;
  });

export const filterRulesPendingDeletion = (
  rules: ExtendedFirewallRule[]
): ExtendedFirewallRule[] =>
  rules.filter((thisRule) => thisRule.status !== 'PENDING_DELETION');

export const prepareRules = compose(
  removeICMPPort,
  filterRulesPendingDeletion,
  editorStateToRules
);

export const hasModified = (editorState: RuleEditorState): boolean => {
  if (editorState.hasModifiedOrder) {
    return true;
  }
  const rules = editorStateToRules(editorState);
  return rules.some((thisRule) => thisRule.status !== 'NOT_MODIFIED');
};

export default produce(ruleEditorReducer);
