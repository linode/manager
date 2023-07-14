import * as React from 'react';

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
      <a
        aria-describedby="external-site"
        href="https://www.linode.com/speed-test/"
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        our speedtest page
      </a>
      {` `}
      to find the best region for your current location.
    </Typography>
  );
};
