import { Typography } from '@linode/ui';
import React from 'react';

export const VlanInterfaceDetailsContent = (props: {
  ipam_address: string;
  vlan_label: string;
}) => {
  const { ipam_address, vlan_label } = props;
  return (
    <>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>VLAN Label</strong>
      </Typography>
      <Typography>{vlan_label}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>IPAM Address</strong>
      </Typography>
      <Typography>{ipam_address}</Typography>
    </>
  );
};
