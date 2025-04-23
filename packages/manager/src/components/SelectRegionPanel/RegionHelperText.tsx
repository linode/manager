import { Box, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { BoxProps } from '@linode/ui';

interface RegionHelperTextProps extends BoxProps {
  onClick?: () => void;
  showCoreHelperText?: boolean;
}

export const RegionHelperText = (props: RegionHelperTextProps) => {
  const { onClick, showCoreHelperText, sx, ...rest } = props;

  return (
    <Box {...rest} component="span" sx={{ ...sx, display: 'block' }}>
      <Typography
        component="span"
        data-testid="region-select-helper-test"
        variant="body1"
      >
        {showCoreHelperText &&
          `Data centers in central locations support a robust set of cloud computing services. `}
        You can use
        {` `}
        <Link onClick={onClick} to="https://www.linode.com/speed-test/">
          our speedtest page
        </Link>
        {` `}
        to find the best region for your current location.
      </Typography>
    </Box>
  );
};
