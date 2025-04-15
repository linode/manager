import { Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { ASSIGN_COMPUTE_INSTANCE_TO_VPC_LINK } from '../constants';

import type { TypographyProps } from '@linode/ui';

/**
 * A shared component that contains a brief description of VPC IPv4 ranges
 */
export const VPCRangesDescription = (props: TypographyProps) => {
  return (
    <Typography {...props}>
      Assign additional IPv4 address ranges that the VPC can use to reach
      services running on this Linode.{' '}
      <Link to={ASSIGN_COMPUTE_INSTANCE_TO_VPC_LINK}>Learn more</Link>.
    </Typography>
  );
};
