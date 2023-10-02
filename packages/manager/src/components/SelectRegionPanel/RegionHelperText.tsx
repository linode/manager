import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import { Box, BoxProps } from '../Box';

interface RegionHelperTextProps extends BoxProps {
  onClick?: () => void;
}

export const RegionHelperText = (props: RegionHelperTextProps) => {
  const { onClick, ...rest } = props;

  return (
    <Box {...rest}>
      <Typography data-testid="region-select-helper-test" variant="body1">
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
