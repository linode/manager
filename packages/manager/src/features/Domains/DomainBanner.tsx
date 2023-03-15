import { DateTime } from 'luxon';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  banner: {
    marginBottom: theme.spacing(),
  },
  dnsWarning: {
    '& h3:first-child': {
      marginBottom: theme.spacing(1),
    },
  },
}));

interface Props {
  hidden: boolean;
}

const KEY = 'domain-banner';

export const DomainBanner: React.FC<Props> = (props) => {
  const { hidden } = props;
  const classes = useStyles();

  if (hidden) {
    return null;
  }

  return (
    <DismissibleBanner
      warning
      important
      className={classes.dnsWarning}
      preferenceKey={KEY}
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: KEY,
      }}
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
};

export default React.memo(DomainBanner);
