import React from 'react';

import { Link } from './Link';
import { Notice, NoticeProps } from './Notice/Notice';
import { Typography } from './Typography';

export const DynamicPriceNotice = (props: NoticeProps) => {
  return (
    <Notice spacingBottom={0} spacingTop={12} variant="info" {...props}>
      <Typography fontWeight="bold">
        Prices for plans, products, and services may vary based on Region.{' '}
        <Link to="https://www.linode.com/pricing">Learn more.</Link>
      </Typography>
    </Notice>
  );
};
