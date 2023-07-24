import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

interface RegionHelperTextProps {
  onClick?: () => void;
}

export const RegionHelperText = (props: RegionHelperTextProps) => {
  const { onClick } = props;

  return (
    <Typography variant="body1">
      You can use
      {` `}
      <Link onClick={onClick} to="https://www.linode.com/speed-test/">
        our speedtest page
      </Link>
      {` `}
      to find the best region for your current location.
    </Typography>
  );
};
