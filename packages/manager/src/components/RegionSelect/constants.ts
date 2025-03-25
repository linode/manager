import type { Region } from '@linode/api-v4';

export const GLOBAL_QUOTA_LABEL = 'Global (Account level)';
export const GLOBAL_QUOTA_VALUE = 'global';

// Ultimately for this option we only need the id and label
// The additional properties are here to satisfy the type.
// It is an unfortunate side effect of wanting to avoid defining a new interface that would modify every util handling region options.
export const regionSelectGlobalOption: Region = {
  capabilities: [],
  country: 'us',
  id: GLOBAL_QUOTA_VALUE,
  label: GLOBAL_QUOTA_LABEL,
  placement_group_limits: {
    maximum_linodes_per_pg: 0,
    maximum_pgs_per_customer: 0,
  },
  resolvers: { ipv4: '', ipv6: '' },
  site_type: 'core',
  status: 'ok',
};
