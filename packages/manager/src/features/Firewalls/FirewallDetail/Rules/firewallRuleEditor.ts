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

import { FirewallRuleType } from '@linode/api-v4/lib/firewalls';
import produce, { Draft, castDraft } from 'immer';
import { compose, last, omit } from 'ramda';

import { FirewallRuleError } from './shared';

export type RuleStatus =
  | 'MODIFIED'
  | 'NEW'
  | 'NOT_MODIFIED'
  | 'PENDING_DELETION';

export interface ExtendedFirewallRule extends FirewallRuleType {
  errors?: FirewallRuleError[];
  index?: number;
  originalIndex: number;
  status: RuleStatus;
}

export type RuleEditorState = ExtendedFirewallRule[][];

export type RuleEditorAction =
  | {
      endIdx: number;
      startIdx: number;
      type: 'REORDER';
    }
  | {
      error: FirewallRuleError;
      idx: number;
      type: 'SET_ERROR';
    }
  | {
      idx: number;
      modifiedRule: Partial<FirewallRuleType>;
      type: 'MODIFY_RULE';
    }
  | {
      idx: number;
      type: 'CLONE_RULE';
    }
  | {
      idx: number;
      type: 'DELETE_RULE';
    }
  | {
      idx: number;
      type: 'UNDO';
    }
  | {
      rule: FirewallRuleType;
      type: 'NEW_RULE';
    }
  | {
      rules: FirewallRuleType[];
      type: 'RESET';
    }
  | {
      type: 'DISCARD_CHANGES';
    };

const ruleEditorReducer = (
  draft: Draft<RuleEditorState>,
  action: RuleEditorAction
) => {
  let lastRevision;
  switch (action.type) {
    case 'NEW_RULE':
      draft.push([
        {
          ...action.rule,
          originalIndex: draft.length,
          status: 'NEW',
        },
      ]);
      return;

    case 'DELETE_RULE':
      lastRevision = last(draft[action.idx]);

      if (!lastRevision) {
        return;
      }

      // Seems pointless to show errors on rules pending deletion.
      delete lastRevision.errors;

      draft[action.idx].push({
        ...lastRevision,
        status: 'PENDING_DELETION',
      });
      return;

    case 'MODIFY_RULE':
      lastRevision = last(draft[action.idx]);

      if (!lastRevision) {
        return;
      }

      // Errors might no longer apply to the modified rule, so we delete them.
      delete lastRevision.errors;

      draft[action.idx].push({
        ...lastRevision,
        ...action.modifiedRule,
        status: 'MODIFIED',
      });
      return;

    case 'CLONE_RULE':
      const ruleToClone = last(draft[action.idx]);
      if (!ruleToClone) {
        return;
      }
      const {
        action: _action,
        addresses,
        description,
        label,
        ports,
        protocol,
      } = ruleToClone;
      draft.push([
        {
          action: _action,
          addresses,
          description,
          label,
          originalIndex: draft.length,
          ports,
          protocol,
          status: 'NEW',
        },
      ]);
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
      draft[action.idx].pop();

      // If there's nothing left on the stack, we need to actually remove this revisionList.
      // This will only happen if a user performing UNDO on a NEW rule.
      if (draft[action.idx].length === 0) {
        draft.splice(action.idx, 1);
      }

      return;

    case 'DISCARD_CHANGES':
      const original: Draft<RuleEditorState> = [];
      draft.forEach((thisRevisionList) => {
        const head = thisRevisionList[0];
        if (head.status === 'NOT_MODIFIED') {
          original[head.originalIndex] = [head];
        }
      });
      return original;

    case 'RESET':
      return initRuleEditorState(action.rules);

    case 'REORDER':
      const [removed] = draft.splice(action.startIdx, 1);
      draft.splice(action.endIdx, 0, removed);
      return;
  }
};

export const curriedFirewallRuleEditorReducer = produce(ruleEditorReducer);

export const initRuleEditorState = (
  rules: FirewallRuleType[]
): RuleEditorState => {
  return (
    rules.map((thisRule, index) => [
      { ...thisRule, originalIndex: index, status: 'NOT_MODIFIED' },
    ]) ?? []
  );
};

export const editorStateToRules = (state: RuleEditorState) => {
  // Cast the results of the Immer state to a mutable data structure.
  return castDraft(
    state.map((revisionList) =>
      // Make a mutable copy of the object since Immer state objects are frozen.
      Object.assign({}, revisionList[revisionList.length - 1])
    )
  );
};

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
    if (
      (thisRule.protocol === 'ICMP' || thisRule.protocol === 'IPENCAP') &&
      thisRule.ports === ''
    ) {
      delete thisRule.ports;
    }
    return thisRule;
  });

const removeEmptyAddressArrays = (rules: ExtendedFirewallRule[]) => {
  return rules.map((rule) => {
    const keepIPv4 = rule.addresses?.ipv4 && rule.addresses.ipv4.length > 0;
    const keepIPv6 = rule.addresses?.ipv6 && rule.addresses.ipv6.length > 0;

    return {
      ...rule,
      addresses: {
        ipv4: keepIPv4 ? rule.addresses?.ipv4 : undefined,
        ipv6: keepIPv6 ? rule.addresses?.ipv6 : undefined,
      },
    };
  });
};

export const filterRulesPendingDeletion = (
  rules: ExtendedFirewallRule[]
): ExtendedFirewallRule[] =>
  rules.filter((thisRule) => thisRule.status !== 'PENDING_DELETION');

export const prepareRules = compose(
  removeEmptyAddressArrays,
  removeICMPPort,
  filterRulesPendingDeletion,
  editorStateToRules
);

export const hasModified = (editorState: RuleEditorState): boolean => {
  const rules = editorStateToRules(editorState);
  return rules.some(
    (thisRule, idx) =>
      thisRule.status !== 'NOT_MODIFIED' || thisRule.originalIndex !== idx
  );
};
