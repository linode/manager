import { Typography } from '@linode/ui';
import React from 'react';

import type { PublicInterfaceData } from '@linode/api-v4';

export const PublicInterfaceDetailsContent = (props: PublicInterfaceData) => {
  const { ipv4 } = props;

  return (
    <>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>IPv4 Addresses</strong>
      </Typography>
      <Typography>tbd</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>IPv6 Addresses</strong>
      </Typography>
      <Typography>tbd</Typography>
    </>
  );
};
