import { createLazyRoute } from '@tanstack/react-router';

import { WafCreate } from 'src/features/Waf/WafCreate/WafCreate';
import { WafDetail } from 'src/features/Waf/WafDetail';
import { WafLanding } from 'src/features/Waf/WafLanding/WafLanding';

export const wafLandingLazyRoute = createLazyRoute('/waf')({
  component: WafLanding,
});

export const wafCreateLazyRoute = createLazyRoute('/waf/create')({
  component: WafCreate,
});

export const wafDetailLazyRoute = createLazyRoute('/waf/$id')({
  component: WafDetail,
});
