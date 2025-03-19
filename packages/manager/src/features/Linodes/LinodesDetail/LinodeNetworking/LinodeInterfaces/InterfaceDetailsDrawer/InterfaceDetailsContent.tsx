import { Stack, Typography } from '@linode/ui';
import React from 'react';

import { getLinodeInterfaceType } from '../utilities';
import { PublicInterfaceDetailsContent } from './PublicInterfaceDetailsContent';
import { VlanInterfaceDetailsContent } from './VlanInterfaceDetailsContent';
import { VPCInterfaceDetailsContent } from './VPCInterfaceDetailsContent';

import type { LinodeInterface } from '@linode/api-v4';

export const InterfaceDetailsContent = (props: LinodeInterface) => {
  const { created, id, mac_address, updated } = props;
  const type = getLinodeInterfaceType(props);

  return (
    <Stack>
      <Typography>
        <strong>Type</strong>
      </Typography>
      <Typography>{type}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>ID</strong>
      </Typography>
      <Typography>{id}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>MAC Address</strong>
      </Typography>
      <Typography>{mac_address}</Typography>
      {props.public && <PublicInterfaceDetailsContent {...props.public} />}
      {props.vpc && <VPCInterfaceDetailsContent {...props.vpc} />}
      {props.vlan && <VlanInterfaceDetailsContent {...props.vlan} />}
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>Created</strong>
      </Typography>
      <Typography>{created}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>Modified</strong>
      </Typography>
      <Typography>{updated}</Typography>
    </Stack>
  );
};
