import { Stack } from '@linode/ui';
import React from 'react';

import { VPCDetails } from './VPCDetails';
import { VPCIPv4Addresses } from './VPCIPv4Addresses';
import { VPCRanges } from './VPCRanges';

interface Props {
  regionId: string;
}

export const VPCInterface = ({ regionId }: Props) => {
  return (
    <Stack spacing={2}>
      <VPCDetails regionId={regionId} />
      <VPCIPv4Addresses />
      <VPCRanges />
    </Stack>
  );
};
