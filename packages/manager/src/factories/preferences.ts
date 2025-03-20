import { Factory } from '@linode/utilities';

import type { ManagerPreferences } from '@linode/utilities';

export const preferencesFactory = Factory.Sync.makeFactory<ManagerPreferences>({
  backups_cta_dismissed: true,
  desktop_sidebar_open: true,
  dismissed_notifications: {
    t: {
      created: '',
      expiry: '',
      id: '',
      label: '',
    },
  },
  domains_group_by_tag: true,
  firewall_beta_notification: true,
  gst_banner_dismissed: true,
  isTableStripingEnabled: true,
  linode_news_banner_dismissed: true,
  linodes_group_by_tag: true,
  linodes_view_style: 'grid',
  longviewTimeRange: '',
  main_content_banner_dismissal: { t: true },
  maskSensitiveData: true,
  nodebalancers_group_by_tag: true,
  sortKeys: {},
  theme: 'light',
  type_to_confirm: true,
  volumes_group_by_tag: true,
});
