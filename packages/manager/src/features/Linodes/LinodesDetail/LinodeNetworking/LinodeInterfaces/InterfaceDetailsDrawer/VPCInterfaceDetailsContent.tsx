import { useVPCQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import type { VPCInterfaceData } from '@linode/api-v4';

export const VPCInterfaceDetailsContent = (props: VPCInterfaceData) => {
  const { vpc_id } = props;
  const { data: vpc } = useVPCQuery(vpc_id, Boolean(vpc_id));
  return (
    <>
      {vpc && (
        <>
          <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
            <strong>VPC</strong>
          </Typography>
          <Typography>
            <Link to={`/vpcs/${vpc_id}`}>{vpc.label}</Link>
          </Typography>
        </>
      )}
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <strong>IPv4 Addresses</strong>
      </Typography>
      <Typography>tbd</Typography>
    </>
  );
};
