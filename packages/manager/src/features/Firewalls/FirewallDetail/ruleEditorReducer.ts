import produce from 'immer';
import { FirewallRules, FirewallRuleType } from 'linode-js-sdk/lib/firewalls';

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

export const initRuleEditorState = (rules: FirewallRules): RuleEditorState => {
  return {
    mode: 'VIEWING',
    revisions: {
      inbound:
        rules.inbound?.map(thisRule => [initRuleWithStatus(thisRule)]) ?? [],
      outbound:
        rules.outbound?.map(thisRule => [initRuleWithStatus(thisRule)]) ?? []
    }
  };
};

export const initRuleWithStatus = (
  rule: FirewallRuleType
): FirewallRuleWithStatus => ({ ...rule, status: 'NOT_MODIFIED' });

export const ruleEditorStateToRules = (state: RuleEditorState) => {
  return {
    inbound: state.revisions.inbound.map(ruleRevisions => {
      const lastRevision = { ...ruleRevisions[ruleRevisions.length - 1] };
      delete lastRevision.status;
    }),
    outbound: state.revisions.outbound.map(ruleRevisions => {
      const lastRevision = { ...ruleRevisions[ruleRevisions.length - 1] };
      delete lastRevision.status;
    })
  };
};

export default produce(ruleEditorReducer);
