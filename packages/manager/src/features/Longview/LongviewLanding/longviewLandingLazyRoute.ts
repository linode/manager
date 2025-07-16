import { createLazyRoute } from '@tanstack/react-router';

import LongviewLanding from 'src/features/Longview/LongviewLanding/LongviewLanding';

export const longviewLandingLazyRoute = createLazyRoute('/longview')({
  component: LongviewLanding,
});
