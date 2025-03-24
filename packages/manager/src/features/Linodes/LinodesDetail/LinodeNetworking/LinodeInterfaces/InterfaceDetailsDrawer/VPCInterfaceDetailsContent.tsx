import { useVPCQuery } from '@linode/queries';
import { CircleProgress, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';

import type { VPCInterfaceData } from '@linode/api-v4';

export const VPCInterfaceDetailsContent = (props: VPCInterfaceData) => {
  const { ipv4, subnet_id, vpc_id } = props;
  const { data: vpc } = useVPCQuery(vpc_id, Boolean(vpc_id));

  const subnet = vpc?.subnets.find((subnet) => subnet.id === subnet_id);

  const ipv4ToTypography = (
    <>
      {ipv4.addresses.map((address) =>
        address.nat_1_1_address ? (
          <>
            <MaskableText
              isToggleable
              key={address.address}
              text={`${address.address} ${address.primary && '(Primary)'}`}
            />
            <MaskableText
              isToggleable
              key={address.nat_1_1_address}
              text={`${address.nat_1_1_address} (VPC NAT)`}
            />
          </>
        ) : (
          <MaskableText
            isToggleable
            key={address.address}
            text={`${address.address} ${address.primary && '(Primary)'}`}
          />
        )
      )}
      {ipv4.ranges.map((range) => (
        <MaskableText
          isToggleable
          key={range.range}
          text={`${range.range} (Range)'}`}
        />
      ))}
    </>
  );

  return (
    <>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>VPC Label</strong>
      </Typography>
      {vpc ? (
        <Link to={`/vpcs/${vpc_id}`}>{vpc.label}</Link>
      ) : (
        <CircleProgress noPadding size="xs" />
      )}
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>Subnet Label</strong>
      </Typography>
      {subnet ? (
        <Typography>{subnet.label}</Typography>
      ) : (
        <CircleProgress noPadding size="xs" />
      )}
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>IPv4 Addresses</strong>
      </Typography>
      {ipv4ToTypography}
    </>
  );
};
