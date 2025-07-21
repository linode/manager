import { createLazyRoute } from '@tanstack/react-router';

import FirewallLanding from 'src/features/Firewalls/FirewallLanding/FirewallLanding';

export const firewallLandingLazyRoute = createLazyRoute('/firewalls')({
  component: FirewallLanding,
});
