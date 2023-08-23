import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

import { Box, BoxProps } from '../Box';
import { DynamicPriceNotice } from '../DynamicPriceNotice';

interface RegionHelperTextProps extends BoxProps {
  hidePricingNotice?: boolean;
  onClick?: () => void;
}

export const RegionHelperText = (props: RegionHelperTextProps) => {
  const { hidePricingNotice, onClick, ...rest } = props;
  const flags = useFlags();

  return (
    <Box {...rest}>
      <Typography variant="body1">
        You can use
        {` `}
        <Link onClick={onClick} to="https://www.linode.com/speed-test/">
          our speedtest page
        </Link>
        {` `}
        to find the best region for your current location.
      </Typography>
      {flags.dcSpecificPricing && !hidePricingNotice && (
        <DynamicPriceNotice spacingBottom={0} spacingTop={8} />
      )}
    </Box>
  );
};
