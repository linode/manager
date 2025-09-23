import { Stack } from '@linode/ui';
import React from 'react';

import { PublicAccess } from '../../EditInterfaceDrawer/VPCInterface/PublicAccess';
import { VPCDetails } from './VPCDetails';
import { VPCIPAddresses } from './VPCIPAddresses';
import { VPCRanges } from './VPCRanges';

interface Props {
  regionId: string;
}

export const VPCInterface = ({ regionId }: Props) => {
  return (
    <Stack spacing={2}>
      <VPCDetails regionId={regionId} />
      <VPCIPAddresses />
      <PublicAccess />
      <VPCRanges />
    </Stack>
  );
};
