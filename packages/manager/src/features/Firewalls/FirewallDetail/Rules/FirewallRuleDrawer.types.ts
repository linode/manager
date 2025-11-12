import type { FirewallOptionItem } from '../../shared';
import type { ExtendedFirewallRule } from './firewallRuleEditor';
import type { Category, FirewallRuleError } from './shared';
import type {
  FirewallPolicyType,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import type { FormikProps } from 'formik';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export type FirewallRuleDrawerMode = 'create' | 'edit';

export interface FirewallRuleDrawerProps {
  category: Category;
  isOpen: boolean;
  mode: FirewallRuleDrawerMode;
  onClose: () => void;
  onSubmit: (category: 'inbound' | 'outbound', rule: FirewallRuleType) => void;
  ruleToModify?: ExtendedFirewallRule;
}

export interface FormState {
  action?: FirewallPolicyType | null;
  addresses?: null | string;
  description?: null | string;
  label?: null | string;
  ports?: null | string;
  protocol?: null | string;
  ruleset?: null | number;
  type?: null | string;
}

export type FirewallCreateEntityType = 'rule' | 'ruleset';

export interface FirewallRuleFormProps extends FormikProps<FormState> {
  addressesLabel: string;
  category: Category;
  createEntityType?: FirewallCreateEntityType;
  ips: ExtendedIP[];
  mode: FirewallRuleDrawerMode;
  /**
   * Optional callback to notify the parent of the current create entity type.
   * Called when the user switches between creating a 'rule' or referencing a 'ruleset'.
   */
  onCreateEntityTypeChange?: (type: FirewallCreateEntityType) => void;
  presetPorts: FirewallOptionItem<string>[];
  ruleErrors?: FirewallRuleError[];
  setIPs: (ips: ExtendedIP[]) => void;
  setPresetPorts: (selected: FirewallOptionItem<string>[]) => void;
}
