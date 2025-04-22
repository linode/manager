import { Stack, Typography } from '@linode/ui';
import React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';

import type { PublicInterfaceData } from '@linode/api-v4';

export const PublicInterfaceDetailsContent = (props: PublicInterfaceData) => {
  const { ipv4, ipv6 } = props;

  const ipv4ToTypography = (
    <>
      {ipv4.addresses.map((address) => (
        <MaskableText
          isToggleable
          key={address.address}
          text={`${address.address} ${address.primary ? '(Primary)' : ''}`}
        />
      ))}
      {ipv4.shared.map((shared) => (
        <MaskableText
          isToggleable
          key={shared.address}
          text={`${shared.address} (Shared)`}
        />
      ))}
    </>
  );

  const ipv6ToTypography = (
    <>
      {ipv6.slaac.map((slaac) => (
        <MaskableText
          isToggleable
          key={slaac.address}
          text={`${slaac.address} (SLAAC)`}
        />
      ))}
      {ipv6.shared.map((shared) => (
        <MaskableText
          isToggleable
          key={shared.range}
          text={`${shared.range} (Shared)`}
        />
      ))}
      {ipv6.ranges.map((range) => (
        <MaskableText
          isToggleable
          key={range.range}
          text={`${range.range} (Range)`}
        />
      ))}
    </>
  );

  return (
    <>
      <Stack>
        <Typography>
          <strong>IPv4 Addresses</strong>
        </Typography>
        {ipv4ToTypography}
      </Stack>
      <Stack>
        <Typography>
          <strong>IPv6 Addresses</strong>
        </Typography>
        {ipv6ToTypography}
      </Stack>
    </>
  );
};
