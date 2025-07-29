import { createLazyRoute } from '@tanstack/react-router';

import VPCLanding from 'src/features/VPCs/VPCLanding/VPCLanding';

export const vpcLandingLazyRoute = createLazyRoute('/')({
  component: VPCLanding,
});
