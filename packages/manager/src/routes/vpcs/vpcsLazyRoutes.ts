import { createLazyRoute } from '@tanstack/react-router';

import VPCCreate from 'src/features/VPCs/VPCCreate/VPCCreate';
import VPCDetail from 'src/features/VPCs/VPCDetail/VPCDetail';
import VPCLanding from 'src/features/VPCs/VPCLanding/VPCLanding';

export const vpcCreateLazyRoute = createLazyRoute('/vpcs/create')({
  component: VPCCreate,
});

export const vpcDetailLazyRoute = createLazyRoute('/vpcs/$vpcId')({
  component: VPCDetail,
});

export const vpcLandingLazyRoute = createLazyRoute('/')({
  component: VPCLanding,
});
