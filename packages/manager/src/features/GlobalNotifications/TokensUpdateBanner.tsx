import * as React from 'react';

import { Box } from 'src/components/Box';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

export const TokensUpdateBanner = () => {
  return (
    <DismissibleBanner important preferenceKey="tokens-update" variant="info">
      <Box
        alignItems="center"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Typography>
          We are improving the Cloud Manager experience for our users.{' '}
          <Link to="">Read more</Link> about recent updates.
        </Typography>
      </Box>
    </DismissibleBanner>
  );
};
