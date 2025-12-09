import { createLazyRoute } from '@tanstack/react-router';

import VPCCreate from 'src/features/VPCs/VPCCreate/VPCCreate';

export const vpcCreateLazyRoute = createLazyRoute('/vpcs/create')({
  component: VPCCreate,
});
