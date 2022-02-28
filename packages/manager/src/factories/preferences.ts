import * as Factory from 'factory.ts';
import { UserPreferences } from '@linode/api-v4/lib';

export const preferencesFactory = Factory.Sync.makeFactory<UserPreferences>({
  longviewTimeRange: '',
  gst_banner_dismissed: true,
  linodes_group_by_tag: true,
  domains_group_by_tag: true,
  volumes_group_by_tag: true,
  nodebalancers_group_by_tag: true,
  linodes_view_style: 'grid',
  theme: 'light',
  desktop_sidebar_open: true,
  sortKeys: {},
  main_content_banner_dismissal: { t: true },
  linode_news_banner_dismissed: true,
  firewall_beta_notification: true,
  backups_cta_dismissed: true,
  type_to_confirm: true,
  dismissed_notifications: {
    t: {
      id: '',
      created: '',
      expiry: '',
      label: '',
    },
  },
});
