import { APIError } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

import { Order } from 'src/components/Pagey';
import { SpacingChoice, ThemeChoice } from 'src/LinodeThemeWrapper';

const actionCreator = actionCreatorFactory(`@@manager/preferences`);

export interface OrderSet {
  order: Order;
  orderBy: string;
}

export type SortKey =
  | 'listening-services'
  | 'active-connections'
  | 'top-processes'
  | 'lv-detail-processes';

export interface UserPreferences {
  longviewTimeRange?: string;
  gst_banner_dismissed?: boolean;
  linodes_group_by_tag?: boolean;
  domains_group_by_tag?: boolean;
  volumes_group_by_tag?: boolean;
  nodebalancers_group_by_tag?: boolean;
  linodes_view_style?: 'grid' | 'list';
  theme?: ThemeChoice;
  spacing?: SpacingChoice;
  desktop_sidebar_open?: boolean;
  sortKeys?: Partial<Record<SortKey, OrderSet>>;
  main_content_banner_dismissal?: Record<string, boolean>;
  linode_news_banner_dismissed?: boolean;
  notification_drawer_view?: 'list' | 'grouped';
}

export const handleGetPreferences = actionCreator.async<
  void,
  UserPreferences,
  APIError[]
>(`get`);

export const handleUpdatePreferences = actionCreator.async<
  UserPreferences,
  UserPreferences,
  APIError[]
>(`update`);
