import { createLazyRoute } from '@tanstack/react-router';

import { FirewallDetail } from 'src/features/Firewalls/FirewallDetail';
import FirewallLanding from 'src/features/Firewalls/FirewallLanding/FirewallLanding';

export const firewallLandingLazyRoute = createLazyRoute('/firewalls')({
  component: FirewallLanding,
});

export const firewallDetailLazyRoute = createLazyRoute('/firewalls/$id')({
  component: FirewallDetail,
});
