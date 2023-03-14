import { UserPreferences } from '@linode/api-v4';
import { Order } from 'src/components/Pagey';
import { ThemeChoice } from 'src/utilities/theme';

export interface OrderSet {
  order: Order;
  orderBy: string;
}

export interface DismissedNotification {
  id: string;
  created: string;
  expiry?: string;
  label?: string;
}

export interface ManagerPreferences extends UserPreferences {
  longviewTimeRange?: string;
  gst_banner_dismissed?: boolean;
  linodes_group_by_tag?: boolean;
  domains_group_by_tag?: boolean;
  volumes_group_by_tag?: boolean;
  nodebalancers_group_by_tag?: boolean;
  linodes_view_style?: 'grid' | 'list';
  theme?: ThemeChoice;
  desktop_sidebar_open?: boolean;
  sortKeys?: Partial<Record<string, OrderSet>>;
  main_content_banner_dismissal?: Record<string, boolean>;
  linode_news_banner_dismissed?: boolean;
  firewall_beta_notification?: boolean;
  backups_cta_dismissed?: boolean;
  type_to_confirm?: boolean;
  dismissed_notifications?: Record<string, DismissedNotification>;
}
