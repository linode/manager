import { createLazyRoute } from '@tanstack/react-router';

import VPCDetail from 'src/features/VPCs/VPCDetail/VPCDetail';

export const vpcDetailLazyRoute = createLazyRoute('/vpcs/$vpcId')({
  component: VPCDetail,
});
