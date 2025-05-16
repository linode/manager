import type { AclpConfig } from '@linode/api-v4';

export type Order = 'asc' | 'desc';

export interface OrderSet {
  order: Order;
  orderBy: string;
}

export type OrderSetWithPrefix<P extends string> = {
  [K in `${P}-order` | `${P}-orderBy`]: K extends `${P}-order` ? Order : string;
};

export interface DismissedNotification {
  created: string;
  expiry?: string;
  id: string;
  label?: string;
}

export type ThemeChoice = 'dark' | 'light' | 'system';

export type ManagerPreferences = Partial<{
  aclpAlertsGroupByTag: boolean;
  aclpPreference: AclpConfig; // Why is this type in @linode/api-v4?
  avatarColor: string;
  backups_cta_dismissed: boolean;
  collapsedSideNavProductFamilies: number[];
  desktop_sidebar_open: boolean;
  dismissed_notifications: Record<string, DismissedNotification>;
  domains_group_by_tag: boolean;
  firewall_beta_notification: boolean;
  gst_banner_dismissed: boolean;
  isAclpAlertsBeta: boolean;
  isAclpMetricsBeta: boolean;
  isTableStripingEnabled: boolean;
  linode_news_banner_dismissed: boolean;
  linodes_group_by_tag: boolean;
  linodes_view_style: 'grid' | 'list';
  longviewTimeRange: string;
  main_content_banner_dismissal: Record<string, boolean>;
  maskSensitiveData: boolean;
  nodebalancers_group_by_tag: boolean;
  pageSizes: Record<string, number>;
  secure_vm_notices: 'always' | 'header' | 'never';
  sortKeys: Partial<Record<string, OrderSet>>;
  theme: ThemeChoice;
  type_to_confirm: boolean;
  volumes_group_by_tag: boolean;
}>;
