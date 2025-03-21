import { Typography } from '@linode/ui';
import React from 'react';

import type { PublicInterfaceData } from '@linode/api-v4';

export const PublicInterfaceDetailsContent = (props: PublicInterfaceData) => {
  const { ipv4, ipv6 } = props;

  const ipv4ToTypography = (
    <>
      {ipv4.addresses.map((address) => (
        <Typography key={address.address}>
          {address.address} {address.primary && '(Primary)'}
        </Typography>
      ))}
      {ipv4.shared.map((shared) => (
        <Typography key={shared.address}>{shared.address} (Shared)</Typography>
      ))}
    </>
  );

  const ipv6ToTypography = (
    <>
      {ipv6.slaac.map((slaac) => (
        <Typography key={slaac.address}>{slaac.address} (SLAAC)</Typography>
      ))}
      {ipv6.shared.map((shared) => (
        <Typography key={shared.range}>{shared.range} (Shared)</Typography>
      ))}
      {ipv6.shared.map((ranges) => (
        <Typography key={ranges.range}>{ranges.range} (Range)</Typography>
      ))}
    </>
  );

  return (
    <>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>IPv4 Addresses</strong>
      </Typography>
      {ipv4ToTypography}
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>IPv6 Addresses</strong>
      </Typography>
      {ipv6ToTypography}
    </>
  );
};
