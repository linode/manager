import type { ExtendedFirewallRule } from './firewallRuleEditor';
import type { ExtendedIP } from 'src/utilities/ipUtils';
import type { FormikProps } from 'formik';
import type { Category, FirewallRuleError } from './shared';
import type {
  FirewallPolicyType,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import type { Item } from 'src/components/EnhancedSelect/Select';

export type FirewallRuleDrawerMode = 'create' | 'edit';

export interface FirewallRuleDrawerProps {
  category: Category;
  mode: FirewallRuleDrawerMode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: 'inbound' | 'outbound', rule: FirewallRuleType) => void;
  ruleToModify?: ExtendedFirewallRule;
}

export interface FormState {
  action: FirewallPolicyType;
  type: string;
  ports?: string;
  addresses: string;
  protocol: string;
  label: string;
  description: string;
}

export interface FirewallRuleFormProps extends FormikProps<FormState> {
  ips: ExtendedIP[];
  setIPs: (ips: ExtendedIP[]) => void;
  presetPorts: Item<string>[];
  setPresetPorts: (selected: Item<string>[]) => void;
  addressesLabel: string;
  mode: FirewallRuleDrawerMode;
  category: Category;
  ruleErrors?: FirewallRuleError[];
}
