import { useVPCQuery } from '@linode/queries';
import { CircleProgress, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';

import type { VPCInterfaceData } from '@linode/api-v4';

export const VPCInterfaceDetailsContent = (props: VPCInterfaceData) => {
  const { ipv4, ipv6, subnet_id, vpc_id } = props;
  const { data: vpc } = useVPCQuery(vpc_id, Boolean(vpc_id));

  const subnet = vpc?.subnets.find((subnet) => subnet.id === subnet_id);

  const ipv4ToTypography = (
    <>
      {ipv4?.addresses.map((address) =>
        address.nat_1_1_address ? (
          <Stack key={address.address}>
            <MaskableText
              isToggleable
              text={`${address.address} ${address.primary && '(Primary)'}`}
            />
            <MaskableText
              isToggleable
              text={`${address.nat_1_1_address} (VPC NAT)`}
            />
          </Stack>
        ) : (
          <MaskableText
            isToggleable
            key={address.address}
            text={`${address.address} ${address.primary && '(Primary)'}`}
          />
        )
      )}
      {ipv4?.ranges.map((range) => (
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
          <strong>VPC Label</strong>
        </Typography>
        {vpc ? (
          <Link to={`/vpcs/${vpc_id}`}>{vpc.label}</Link>
        ) : (
          <CircleProgress noPadding size="xs" />
        )}
      </Stack>
      <Stack>
        <Typography>
          <strong>Subnet Label</strong>
        </Typography>
        {subnet ? (
          <Typography>{subnet.label}</Typography>
        ) : (
          <CircleProgress noPadding size="xs" />
        )}
      </Stack>
      <Stack>
        <Typography>
          <strong>IPv4 Addresses</strong>
        </Typography>
        {ipv4ToTypography}
      </Stack>
      {ipv6 && (
        <Stack>
          <Typography>
            <strong>IPv6 Addresses</strong>
          </Typography>
          {ipv6.slaac.map((address) => {
            return (
              <>
                <MaskableText
                  isToggleable
                  key={address.address}
                  text={`${address.address} (SLAAC)`}
                />
                {address.range && (
                  <MaskableText
                    isToggleable
                    key={address.range}
                    text={`${address.range} (Range)`}
                  />
                )}
              </>
            );
          })}
          {ipv6?.ranges.map((range) => (
            <MaskableText
              isToggleable
              key={range.range}
              text={`${range.range} (Range)`}
            />
          ))}
        </Stack>
      )}
    </>
  );
};
