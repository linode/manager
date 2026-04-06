import { Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';

interface DomainBannerProps {
  hidden: boolean;
}

const KEY = 'domain-banner';

export const DomainBanner = React.memo((props: DomainBannerProps) => {
  const { hidden } = props;

  if (hidden) {
    return null;
  }

  return (
    <StyledDismissibleBanner
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: KEY,
      }}
      preferenceKey={KEY}
      variant="warning"
    >
      <Stack>
        <Typography>
          <strong>Your DNS zones are not being served.</strong>
        </Typography>
        <Typography>
          Your domains will not be served by Linode&rsquo;s nameservers unless
          you have at least one active Linode on your account.{` `}
          <Link to="/linodes/create">You can create one here.</Link>
        </Typography>
      </Stack>
    </StyledDismissibleBanner>
  );
});

const StyledDismissibleBanner = styled(DismissibleBanner, {
  label: 'StyledDismissableBanner',
})(({ theme }) => ({
  '& h3:first-of-type': {
    margin: theme.spacing(1),
  },
}));
