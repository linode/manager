import { Stack, Typography } from '@linode/ui';
import React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';

export const VlanInterfaceDetailsContent = (props: {
  ipam_address: string;
  vlan_label: string;
}) => {
  const { ipam_address, vlan_label } = props;
  return (
    <>
      <Stack>
        <Typography>
          <strong>VLAN Label</strong>
        </Typography>
        <Typography>{vlan_label}</Typography>
      </Stack>
      <Stack>
        <Typography>
          <strong>IPAM Address</strong>
        </Typography>
        <Typography>
          <MaskableText isToggleable text={ipam_address} />
        </Typography>
      </Stack>
    </>
  );
};
