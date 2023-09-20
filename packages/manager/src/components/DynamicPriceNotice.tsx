import React from 'react';

import { useRegionsQuery } from 'src/queries/regions';

import { Link } from './Link';
import { Notice, NoticeProps } from './Notice/Notice';
import { Typography } from './Typography';

interface Props extends NoticeProps {
  region: string;
}

export const DynamicPriceNotice = (props: Props) => {
  const { data: regions } = useRegionsQuery();
  const { region, ...rest } = props;

  const regionLabel = regions?.find((r) => r.id === region)?.label ?? region;

  return (
    <Notice
      dataTestId="dynamic-pricing-notice"
      spacingBottom={0}
      spacingTop={12}
      variant="warning"
      {...rest}
    >
      <Typography fontWeight="bold">
        Prices for plans, products, and services in {regionLabel} may vary from
        other regions.{' '}
        <Link to="https://www.linode.com/pricing">Learn more.</Link>
      </Typography>
    </Notice>
  );
};
