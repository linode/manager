import { createLazyRoute } from '@tanstack/react-router';

import { FirewallDetail } from 'src/features/Firewalls/FirewallDetail';

export const firewallDetailLazyRoute = createLazyRoute('/firewalls/$id')({
  component: FirewallDetail,
});
