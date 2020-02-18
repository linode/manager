import produce from 'immer';
import { FirewallRuleType } from 'linode-js-sdk/lib/firewalls';

type RuleStatus = 'NOT_MODIFIED' | 'MODIFIED' | 'NEW' | 'PENDING_DELETION';

export interface FirewallRuleWithStatus extends FirewallRuleType {
  status: RuleStatus;
}

export interface RuleEditorState {
  mode: 'VIEWING' | 'EDITING';
  revisions: {
    inbound: FirewallRuleWithStatus[][];
    outbound: FirewallRuleWithStatus[][];
  };
}

type RuleType = 'inbound' | 'outbound';

export type RuleEditorAction =
  | {
      type: 'NEW_RULE';
      ruleType: RuleType;
      rule: FirewallRuleType;
    }
  | {
      type: 'DELETE_RULE';
      ruleType: RuleType;
      idx: number;
    }
  | {
      type: 'MODIFY_RULE';
      ruleType: RuleType;
      idx: number;
      modifiedRule: Partial<FirewallRuleType>;
    };

// Types of modifications:
//
// 1. New rule
// 2. Delete rule
// 3. Modify rule

const ruleEditorReducer = (
  draft: RuleEditorState,
  action: RuleEditorAction
) => {
  switch (action.type) {
    case 'NEW_RULE':
      draft.mode = 'EDITING';
      draft.revisions[action.ruleType].push([
        { ...action.rule, status: 'NEW' }
      ]);
      break;

    case 'DELETE_RULE':
      draft.mode = 'EDITING';
      // @todo: handle failure
      let ruleRevisions = draft.revisions[action.ruleType][action.idx];
      let rule = ruleRevisions[ruleRevisions.length - 1];

      draft.revisions[action.ruleType][action.idx].push({
        ...rule,
        status: 'PENDING_DELETION'
      });
      break;

    case 'MODIFY_RULE':
      draft.mode = 'EDITING';
      ruleRevisions = draft.revisions[action.ruleType][action.idx];
      rule = ruleRevisions[ruleRevisions.length - 1];

      draft.revisions[action.ruleType][action.idx].push({
        ...rule,
        ...action.modifiedRule,
        status: 'MODIFIED'
      });
      break;
  }
};

export default produce(ruleEditorReducer);
