import type { FirewallOptionItem, PrefixListRuleReference } from '../../shared';
import type { PrefixListDrawerContext } from './FirewallPrefixListDrawer';
import type { ExtendedFirewallRule } from './firewallRuleEditor';
import type { Category, FirewallRuleError } from './shared';
import type {
  FirewallPolicyType,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import type { FormikProps } from 'formik';
import type { ExtendedIP, ExtendedPL } from 'src/utilities/ipUtils';

export type FirewallRuleDrawerMode = 'create' | 'edit' | 'view';

export interface FirewallRuleDrawerProps {
  category: Category;
  handleOpenPrefixListDrawer: (
    prefixListLabel: string,
    plRuleRef: PrefixListRuleReference,
    contextType: PrefixListDrawerContext['type']
  ) => void;
  isOpen: boolean;
  mode: FirewallRuleDrawerMode;
  onClose: () => void;
  onSubmit: (category: 'inbound' | 'outbound', rule: FirewallRuleType) => void;
  ruleToModifyOrView?: ExtendedFirewallRule;
}

export interface FormState {
  action: FirewallPolicyType;
  addresses: string;
  description: string;
  label: string;
  ports?: string;
  protocol: string;
  type: string;
}

export interface FormRuleSetState {
  ruleset: number;
}

export type FirewallCreateEntityType = 'rule' | 'ruleset';

export interface FirewallRuleFormProps extends FormikProps<FormState> {
  addressesLabel: string;
  category: Category;
  closeDrawer: () => void;
  ips: ExtendedIP[];
  mode: FirewallRuleDrawerMode;
  pls: ExtendedPL[];
  presetPorts: FirewallOptionItem<string>[];
  ruleErrors?: FirewallRuleError[];
  setIPs: (ips: ExtendedIP[]) => void;
  setPLs: (pls: ExtendedPL[]) => void;
  setPresetPorts: (selected: FirewallOptionItem<string>[]) => void;
}

export interface FirewallRuleSetFormProps
  extends FormikProps<FormRuleSetState> {
  category: Category;
  closeDrawer: () => void;
  handleOpenPrefixListDrawer: (
    prefixListLabel: string,
    plRuleRef: PrefixListRuleReference
  ) => void;
  ruleErrors?: FirewallRuleError[];
}
