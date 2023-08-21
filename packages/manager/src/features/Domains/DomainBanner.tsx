import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

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
      warning
      important
      preferenceKey={KEY}
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: KEY,
      }}
    >
      <>
        <StyledTypography>
          <strong>Your DNS zones are not being served.</strong>
        </StyledTypography>
        <Typography>
          Your domains will not be served by Linode&rsquo;s nameservers unless
          you have at least one active Linode on your account.{` `}
          <Link to="/linodes/create">You can create one here.</Link>
        </Typography>
      </>
    </StyledDismissibleBanner>
  );
});

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    marginBottom: theme.spacing(),
  })
);

const StyledDismissibleBanner = styled(DismissibleBanner, {
  label: 'StyledDismissableBanner',
})(({ theme }) => ({
  '& h3:first-of-type': {
    marginBottom: theme.spacing(1),
  },
}));
