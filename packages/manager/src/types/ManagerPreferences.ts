import { UserPreferences } from '@linode/api-v4';

import { Order } from 'src/components/Pagey';
import { ThemeChoice } from 'src/utilities/theme';

export interface OrderSet {
  order: Order;
  orderBy: string;
}

export interface DismissedNotification {
  created: string;
  expiry?: string;
  id: string;
  label?: string;
}

export interface ManagerPreferences extends UserPreferences {
  backups_cta_dismissed?: boolean;
  desktop_sidebar_open?: boolean;
  dismissed_notifications?: Record<string, DismissedNotification>;
  domains_group_by_tag?: boolean;
  firewall_beta_notification?: boolean;
  gst_banner_dismissed?: boolean;
  linode_news_banner_dismissed?: boolean;
  linodes_group_by_tag?: boolean;
  linodes_view_style?: 'grid' | 'list';
  longviewTimeRange?: string;
  main_content_banner_dismissal?: Record<string, boolean>;
  nodebalancers_group_by_tag?: boolean;
  pageSizes?: Record<string, number>;
  sortKeys?: Partial<Record<string, OrderSet>>;
  theme?: ThemeChoice;
  type_to_confirm?: boolean;
  volumes_group_by_tag?: boolean;
}
