import { Theme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import DismissibleBanner from 'src/components/DismissibleBanner';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  banner: {
    marginBottom: theme.spacing(),
  },
  dnsWarning: {
    '& h3:first-of-type': {
      marginBottom: theme.spacing(1),
    },
  },
}));

interface DomainBannerProps {
  hidden: boolean;
}

const KEY = 'domain-banner';

export const DomainBanner = React.memo((props: DomainBannerProps) => {
  const { hidden } = props;
  const { classes } = useStyles();

  if (hidden) {
    return null;
  }

  return (
    <DismissibleBanner
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: KEY,
      }}
      className={classes.dnsWarning}
      important
      preferenceKey={KEY}
      warning
    >
      <>
        <Typography className={classes.banner}>
          <strong>Your DNS zones are not being served.</strong>
        </Typography>
        <Typography>
          Your domains will not be served by Linode&rsquo;s nameservers unless
          you have at least one active Linode on your account.{` `}
          <Link to="/linodes/create">You can create one here.</Link>
        </Typography>
      </>
    </DismissibleBanner>
  );
});
